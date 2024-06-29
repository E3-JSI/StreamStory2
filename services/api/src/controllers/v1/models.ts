import { NextFunction, Request, Response } from 'express';

import * as models from '../../db/models';
import { User } from '../../db/users';
import { TrainedModel } from '../../lib/Modelling';
import { isValidUuid } from '../../utils/misc';
import modelling from '../../config/modelling';

export interface ModelResponse {
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

/**
 * Generate model response from model.
 * @param model Model.
 * @param metadata Indicates if only metadata should be included.
 * @returns Model response object.
 */
function getModelResponse(model: models.Model, metadata = false): ModelResponse {
    const modelResponse: ModelResponse = {
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

// export async function createModel(req: Request, res: Response, next: NextFunction): Promise<void> {
//     const user = req.user as User;
//     const { name, description, dataset, public: isPublic } = req.body;

//     try {
//         if (!name || !description || !dataset) {
//             res.status(400).json({
//                 error: 'Name, description and dataset are required.',
//             });
//             return;
//         }

//         const model = await models.create(user.id, name, description, dataset, isPublic);
//         res.status(201).json(getModelResponse(model, false));
//     } catch (error) {
//         next(error);
//     }
// }

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

        // if (!model.online) {
        //     res.status(400).json({
        //         error: 'The model is not online.',
        //     });
        //     return;
        // }

        // if (!model.active) {
        //     res.status(400).json({
        //         error: 'The model is not active.',
        //     });
        //     return;
        // }

        const isJsonData =
            req.is('application/json') &&
            typeof req.body === 'object' &&
            Array.isArray(req.body.data) &&
            req.body.data.every((d: unknown) => typeof d === 'object');
        const isCsvData = req.is('text/csv') && typeof req.body === 'string' && req.body.length > 0;

        if (!isJsonData && !isCsvData) {
            res.status(400).json({
                error: 'The data is missing or invalid.',
            });
            return;
        }

        const res2 = await modelling.classifyData(
            isJsonData ? req.body.data : req.body,
            model.model
        );

        res.status(200).json({
            ...res2,
        });
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
