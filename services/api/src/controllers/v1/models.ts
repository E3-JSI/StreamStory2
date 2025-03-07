// import fs from 'fs';
// import path from 'path';

// import slugify from 'slugify';
import { NextFunction, Request, Response } from 'express';

import * as models from '../../db/models';
import { User } from '../../db/users';
import { TrainedModel } from '../../lib/Modelling';
import { isValidUuid } from '../../utils/misc';
import modelling from '../../config/modelling';

export interface ModelResponse {
    id: number;
    uuid: string;
    name: string;
    description: string;
    dataset: string;
    username: string;
    online: boolean;
    active: boolean;
    public: boolean;
    createdAt: number;
    model?: TrainedModel;
}

export type FileFormat = 'csv' | 'json';

/**
 * Generate model response from model.
 * @param model Model.
 * @param metadata Indicates if only metadata should be included.
 * @returns Model response object.
 */
function getModelResponse(model: models.Model, metadata = false): ModelResponse {
    const modelResponse: ModelResponse = {
        id: model.id,
        uuid: model.uuid,
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

// function getDataDirName(req: Request): string {
//     return slugify(req.user?.email || 'temp');
// }

// function getDataDirPath(req: Request, create = false): string {
//     const dirPath = path.resolve('data', 'uploads', getDataDirName(req));

//     if (create && !fs.existsSync(dirPath)) {
//         fs.mkdirSync(dirPath, { recursive: true });
//     }

//     return dirPath;
// }

// function getDataFileName(format: FileFormat = 'csv'): string {
//     return `data.${format}`;
// }

// function getDataFilePath(req: Request, createDir = false, format: FileFormat = 'csv'): string {
//     return path.join(getDataDirPath(req, createDir), getDataFileName(format));
// }

// function cleanUpData(req: Request) {
//     const dirPath = getDataDirPath(req);

//     if (fs.existsSync(dirPath)) {
//         fs.rmdirSync(getDataDirPath(req), { recursive: true });
//     }
// }

export async function getModels(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;
    const { includePublic, includeShared } = req.query;

    try {
        const modelList = await models.get(
            user.id,
            includePublic === 'true',
            includeShared === 'true'
        );
        res.status(200).json({
            models: modelList.map((model) => getModelResponse(model, true)),
        });
    } catch (error) {
        next(error);
    }
}

export async function getModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;
    const modelUuid = req.params.uuid;

    try {
        if (!isValidUuid(modelUuid)) {
            res.status(400).json({
                error: 'The model UUID is not valid.',
            });
            return;
        }

        const model = await models.findByUuid(modelUuid);
        if (!model) {
            res.status(404).json({
                error: `The model does't exist.`,
            });
            return;
        }

        const userIds = await models.getModelUsers(model.id);
        if (user.id !== model.userId && !userIds.includes(user.id) && !model.public) {
            res.status(401).json({
                error: "You don't have permission to retrive this model.",
            });
            return;
        }

        res.status(200).json(getModelResponse(model, false));
    } catch (error) {
        next(error);
    }
}

export async function getModelClassification(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const user = req.user as User;
    const modelUuid = req.params.uuid;

    try {
        if (!isValidUuid(modelUuid)) {
            res.status(400).json({
                error: 'The model UUID is not valid.',
            });
            return;
        }

        const model = await models.findByUuid(modelUuid);
        if (!model) {
            res.status(404).json({
                error: `The model does't exist.`,
            });
            return;
        }

        const userIds = await models.getModelUsers(model.id);
        if (user.id !== model.userId && !userIds.includes(user.id) && !model.public) {
            res.status(401).json({
                error: "You don't have permission to retrive this model.",
            });
            return;
        }

        if (!model.model) {
            res.status(400).json({
                error: 'The model is missing.',
            });
            return;
        }

        const isJsonData =
            req.is('application/json') && Array.isArray(req.body) && req.body.length > 0;
        const isCsvData = req.is('text/csv') && typeof req.body === 'string' && req.body.length > 0;

        if (!isJsonData && !isCsvData) {
            res.status(400).json({
                error: 'The data is missing or invalid.',
            });
            return;
        }

        const res2 = await modelling.classifyData(req.body, model.model);

        res.status(200).json({
            ...res2,
        });
    } catch (error) {
        next(error);
    }
}

export async function buildModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;
    const {
        name,
        description = '',
        dataset,
        public: isPublic = false,
        dataSource,
        config,
    } = req.body;

    if (!name || typeof name !== 'string' || name.length === 0) {
        res.status(400).json({
            error: 'The name is missing or invalid.',
        });
        return;
    }

    if (!dataset || typeof dataset !== 'string' || dataset.length === 0) {
        res.status(400).json({
            error: 'The dataset is missing or invalid.',
        });
        return;
    }

    if (!dataSource || typeof dataSource !== 'object') {
        res.status(400).json({
            error: 'The data source is missing or invalid.',
        });
        return;
    }

    if (!config || typeof config !== 'object') {
        res.status(400).json({
            error: 'The configuration is missing or invalid.',
        });
        return;
    }

    const { format, fieldSep, data } = dataSource;

    if (!format || !['csv', 'json'].includes(format)) {
        res.status(400).json({
            error: 'The data format is missing or invalid.',
        });
        return;
    }

    if (!data || (!Array.isArray(data) && typeof data !== 'string') || data.length === 0) {
        res.status(400).json({
            error: 'The data is missing or invalid.',
        });
        return;
    }

    let separator: ',' | ';' = ',';
    if (format === 'csv' && [';', ','].includes(fieldSep)) {
        separator = fieldSep;
    }

    if (format)
        try {
            let csvData = '';
            if (format === 'csv' && typeof data === 'string') {
                csvData = data;
            } else if (format === 'json' && Array.isArray(data)) {
                csvData = Object.keys(data[0]).join(separator);
                csvData += '\n';

                data.forEach((row: Record<string, unknown>) => {
                    csvData += Object.values(row).join(separator);
                    csvData += '\n';
                });
            }

            // cleanUpData(req);

            // const dataFilePath = getDataFilePath(req, true, 'csv');
            // fs.writeFileSync(dataFilePath, csvData);

            const modellingResponse = await modelling.build({
                dataSource: {
                    type: 'internal',
                    // type: 'file',
                    format: 'csv',
                    fieldSep: separator,
                    data: csvData,
                    // fileName: dataFilePath,
                },
                config,
            });

            // cleanUpData(req);

            if (modellingResponse.status === 'error') {
                res.status(400).json({
                    error: modellingResponse.errors,
                });
                return;
            }

            const model = JSON.stringify(modellingResponse.model);
            const modelId = await models.add(user.id, 0, name, description, dataset, false, model);
            if (isPublic) {
                await models.setPublic(modelId, true);
            }

            const modelData = await models.findById(modelId);

            if (!modelData) {
                res.status(500).json({
                    error: 'Failed to create the model.',
                });
                return;
            }

            res.status(201).json(getModelResponse(modelData, false));
        } catch (error) {
            next(error);
        }
}

export async function deleteModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;
    const modelUuid = req.params.uuid;

    try {
        if (!isValidUuid(modelUuid)) {
            res.status(400).json({
                error: 'The model UUID is not valid.',
            });
            return;
        }

        const model = await models.findByUuid(modelUuid);
        if (!model) {
            res.status(404).json({
                error: `The model does't exist.`,
            });
            return;
        }

        if (user.id !== model.userId) {
            res.status(401).json({
                error: "You don't have permission to delete this model.",
            });
            return;
        }

        await models.del(model.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
