import { once } from 'events';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

import { NextFunction, Request, Response } from 'express';
import csvParse from 'csv-parse/lib/sync';
import multer from 'multer';
import slugify from 'slugify';

import * as models from '../db/models';
import { Model } from '../db/models';
import { User } from '../db/users';
import { isNumeric } from '../utils/misc';

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
    model?: string;
}

export interface DataAttribute {
    name: string;
    numeric: boolean;
}

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
 * @returns Model response object.
 */
export function getModelResponse(model: Model, metaOnly = false): ModelResponse {
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

    return metaOnly
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
    const dataRoot = path.join('data', 'uploads');
    const dirPath = path.join(dataRoot, getDataDirName(req));

    if (create && !fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    return dirPath;
}

function getDataFileName(): string {
    return 'data.csv';
}

function getDataFilePath(req: Request, createDir = false): string {
    return path.join(getDataDirPath(req, createDir), getDataFileName());
}

function cleanUpData(req: Request) {
    const dirPath = getDataDirPath(req);

    if (fs.existsSync(dirPath)) {
        fs.rmdirSync(getDataDirPath(req), { recursive: true });
    }
}

async function getAttributes(filePath: string): Promise<DataAttribute[]> {
    const attributes: DataAttribute[] = [];

    try {
        const lines: string[][] = [];
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });
        const readFirstLines = (line: string) => {
            lines.push(...csvParse(line));

            if (lines.length > 1) {
                rl.off('line', readFirstLines).close();
            }
        };

        rl.on('line', readFirstLines);
        await once(rl, 'close');

        if (lines.length === 2 && lines[0].length === lines[1].length) {
            const [header, data] = lines;

            header.forEach((h, i) => {
                attributes.push({
                    name: h,
                    numeric: isNumeric(data[i]),
                });
            });
        }
    } catch {
        // Failed to read attributes.
    }

    return attributes;
}

export async function storeData(req: Request, res: Response, next: NextFunction): Promise<void> {
    upload(req, res, async (err: unknown) => {
        try {
            if (err) {
                throw err;
            }

            const attributes = await getAttributes(getDataFilePath(req));

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

export async function createModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;

    try {
        // TODO:
        // Generate call JSON
        // Send request
        const model = '{}';

        // Delete dataset.
        cleanUpData(req);

        // TODO: form validation/sanitation (use: express-validation!?).
        const { name, description, dataset, online } = req.body;
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

        if (!model || user.id !== model.userId) {
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

        // TODO: form validation/sanitation (use: express-validation!?).
        if (req.body.description !== undefined) {
            const success = await models.updateDescription(modelId, req.body.description);

            if (!success) {
                res.status(500).json({
                    error: ['description_update_failed'],
                });
                return;
            }
        } else if (req.body.public !== undefined) {
            const success = await models.setPublic(modelId, req.body.public);

            if (!success) {
                res.status(500).json({
                    error: [req.body.public ? 'model_sharing_failed' : 'model_unsharing_failed'],
                });
                return;
            }
        }

        res.status(200).json({
            model: getModelResponse((await models.findById(modelId)) as Model),
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
