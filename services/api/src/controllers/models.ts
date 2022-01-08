import fs from 'fs';
import path from 'path';

import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import slugify from 'slugify';

import modelling from '../config/modelling';
import { downloadFile } from '../lib/http';
import { getDatasetAttributes, TrainedModel } from '../lib/Modelling';
import * as dataSources from '../db/dataSources';
import * as models from '../db/models';
import { Model } from '../db/models';
import { User, UserGroup } from '../db/users';

export interface ModelResponse {
    id: number;
    username: string;
    name: string;
    description: string;
    dataset: string;
    online: boolean;
    active: boolean;
    public: boolean;
    createdAt: number;
    model?: TrainedModel;
}

export interface DataResponse {
    series: Record<string, unknown>[];
}

export type FileFormat = 'csv' | 'json';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, getDataDirPath(req, true));
    },
    filename(req, file, cb) {
        cb(null, getDataFileName());
    },
});
const upload = multer({ storage }).single('file');

/**
 * Generate model response from model.
 * @param model Model.
 * @param metadata Indicates if only metadata should be included.
 * @returns Model response object.
 */
function getModelResponse(model: Model, metadata = false): ModelResponse {
    const modelResponse = {
        id: model.id,
        username: model.username,
        name: model.name,
        description: model.description,
        dataset: model.dataset,
        online: model.online,
        active: model.active,
        public: model.public,
        createdAt: model.createdAt,
    };

    return metadata
        ? modelResponse
        : {
              ...modelResponse,
              model: model.model,
          };
}

function getDataDirName(req: Request): string {
    return slugify(req.user?.email || 'temp');
}

function getDataDirPath(req: Request, create = false): string {
    const dirPath = path.resolve('data', 'uploads', getDataDirName(req));

    if (create && !fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    return dirPath;
}

function getDataFileName(format: FileFormat = 'csv'): string {
    return `data.${format}`;
}

function getDataFilePath(req: Request, createDir = false, format: FileFormat = 'csv'): string {
    return path.join(getDataDirPath(req, createDir), getDataFileName(format));
}

function cleanUpData(req: Request) {
    const dirPath = getDataDirPath(req);

    if (fs.existsSync(dirPath)) {
        fs.rmdirSync(getDataDirPath(req), { recursive: true });
    }
}

export async function storeData(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.body.dataSourceId) {
        const user = req.user as User;

        try {
            const dataSource = await dataSources.findById(Number(req.body.dataSourceId));

            if (!dataSource) {
                res.status(404).json({
                    error: ['data_source_not_found'],
                });
                return;
            }

            if (dataSource.userId !== user.id && user.groupId !== UserGroup.Admin) {
                res.status(401).json({
                    error: ['unauthorized'],
                });
                return;
            }

            const dataPath = getDataFilePath(req, true);
            const query = Object.entries({
                from: dataSource.timeWindowStart,
                to: dataSource.timeWindowEnd,
                interval: dataSource.interval,
                format: 'csv',
            })
                .map((entry) => `${entry[0]}=${entry[1]}`)
                .join('&');
            const success = await downloadFile(`${dataSource.url}/series?${query}`, dataPath);

            if (!success) {
                res.status(404).json({
                    error: ['no_data'],
                });
                return;
            }

            const attributes = await getDatasetAttributes(dataPath);

            if (attributes.length < 2) {
                cleanUpData(req);
            }

            res.status(200).json({
                attributes,
            });
        } catch (error) {
            next(error);
        }
    } else {
        upload(req, res, async (err: unknown) => {
            try {
                if (err) {
                    throw err;
                }

                const attributes = await getDatasetAttributes(getDataFilePath(req));

                if (attributes.length < 2) {
                    cleanUpData(req);
                }

                res.status(200).json({
                    attributes,
                });
            } catch (error) {
                cleanUpData(req);
                next(error);
            }
        });
    }
}

export async function deleteData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        cleanUpData(req);

        res.status(200).json({
            success: true,
        });
    } catch (error) {
        next(error);
    }
}

export async function addModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;

    try {
        const {
            selectedAttributes,
            timeAttribute,
            timeUnit,
            includeTimeAttribute,
            categoricalAttributes,
            derivatives,
            numberOfStates,
            name,
            description,
            dataset,
            online,
        } = req.body;

        // Build model.
        const modellingResponse = await modelling.buildFromModelConfig({
            filePath: getDataFilePath(req),
            selectedAttributes,
            timeAttribute,
            timeUnit,
            includeTimeAttribute,
            categoricalAttributes,
            derivatives,
            numberOfStates,
            numberOfHistogramBuckets: 10,
        });

        if (modellingResponse.status === 'error') {
            res.status(400).json({
                error: modellingResponse.errors,
            });
            return;
        }

        const model = JSON.stringify(modellingResponse.model);

        // Delete dataset.
        cleanUpData(req);

        // TODO: form validation/sanitation (use: express-validation!?).
        const modelId = await models.add(user.id, name, description, dataset, online, model);

        if (!modelId) {
            res.status(500).json({
                error: ['model_addition_failed'],
            });
            return;
        }

        const modelData = await models.findById(modelId);

        if (!modelData) {
            res.status(500).json({
                error: ['db_query_failed'],
            });
            return;
        }

        res.status(200).json({
            model: getModelResponse(modelData, true),
            error: modellingResponse.errors,
        });
    } catch (error) {
        next(error);
    }
}

export async function getModels(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;

    try {
        const modelList = await models.get(user.id, true);
        res.status(200).json({
            models: modelList.map((model) => getModelResponse(model, true)),
        });
    } catch (error) {
        next(error);
    }
}

export async function getModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;
    const modelId = Number(req.params.id);

    try {
        const model = await models.findById(modelId);

        if (!model || (user.id !== model.userId && !model.public)) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        res.status(200).json({
            model: getModelResponse(model),
        });
    } catch (error) {
        next(error);
    }
}

export async function updateModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;
    const modelId = Number(req.params.id);

    try {
        const model = await models.findById(modelId);

        if (!model || user.id !== model.userId) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        let metadata = false;

        // TODO: form validation/sanitation (use: express-validation!?).
        if (req.body.description !== undefined) {
            const success = await models.updateDescription(modelId, req.body.description);
            metadata = true;

            if (!success) {
                res.status(500).json({
                    error: ['description_update_failed'],
                });
                return;
            }
        } else if (req.body.public !== undefined) {
            const success = await models.setPublic(modelId, req.body.public);
            metadata = true;

            if (!success) {
                res.status(500).json({
                    error: [req.body.public ? 'model_sharing_failed' : 'model_unsharing_failed'],
                });
                return;
            }
        } else if (req.body.active !== undefined) {
            const success = await models.setActive(modelId, req.body.active);
            metadata = true;

            if (!success) {
                res.status(500).json({
                    error: [
                        req.body.active ? 'model_activation_failed' : 'model_deactivation_failed',
                    ],
                });
                return;
            }
        }

        res.status(200).json({
            model: getModelResponse((await models.findById(modelId)) as Model, metadata),
        });
    } catch (error) {
        next(error);
    }
}

export async function updateModelState(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const user = req.user as User;
    const modelId = Number(req.params.id);
    const { initialStates } = req.body;

    try {
        const model = await models.findById(modelId);

        if (!model || user.id !== model.userId) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        if (!initialStates || initialStates === '') {
            res.status(400).json({
                error: ['field_intitialStates_must_be_provided'],
            });
            return;
        }

        let stateFound = null;

        if (!model.model) {
            res.status(500).json({
                error: ['model_update_failed'],
            });
            return;
        }

        for (let i = 0; i < model.model.scales.length; i++) {
            const scale = model.model.scales[i];

            for (let j = 0; j < scale.states.length; j++) {
                const state = scale.states[j];

                if (!state.sameAsParent && state.initialStates.toString() === initialStates) {
                    stateFound = state;
                    break;
                }
            }
        }

        if (stateFound != null) {
            const uiNew = {
                label: req.body.label && req.body.label != null ? req.body.label : null,
                description:
                    req.body.description && req.body.description != null
                        ? req.body.description
                        : null,
                eventId: req.body.eventId && req.body.eventId != null ? req.body.eventId : null, // TODO: set eventId if model online only
            };
            stateFound.ui = { ...(stateFound.ui ? stateFound.ui : {}), ...uiNew };
            // TODO: Validate model
            const success = await models.updateModel(modelId, model.model); // update model with new 'ui' obj

            if (!success) {
                res.status(500).json({
                    error: ['model_update_failed'],
                });
                return;
            }
        } else {
            res.status(500).json({
                error: ['state_not_found'],
            });
            return;
        }
        const modelInDb = await models.findById(modelId);

        if (!modelInDb) {
            res.status(500).json({
                error: ['updated_model_not_found'],
            });
            return;
        }
        res.status(200).json({
            model: getModelResponse(modelInDb),
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;
    const modelId = Number(req.params.id);

    try {
        const model = await models.findById(modelId);

        if (!model || user.id !== model.userId) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const success = await models.del(modelId);

        if (!success) {
            res.status(500).json({
                error: ['model_deletion_failed'],
            });
            return;
        }

        res.status(200).json({
            success,
        });
    } catch (error) {
        next(error);
    }
}
