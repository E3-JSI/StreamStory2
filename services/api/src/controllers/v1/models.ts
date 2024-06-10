import { NextFunction, Request, Response } from 'express';

import * as models from '../../db/models';
import { User } from '../../db/users';
import { TrainedModel } from '../../lib/Modelling';
import { isValidUuid } from '../../utils/misc';

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
    const modelId = req.params.uuid;

    try {
        if (!isValidUuid(modelId)) {
            res.status(400).json({
                error: 'The model UUID is not valid.',
            });
            return;
        }

        const model = await models.findByUuid(modelId);
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

export async function deleteModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = req.user as User;
    const modelId = req.params.id;

    try {
        if (!isValidUuid(modelId)) {
            res.status(400).json({
                error: 'The model UUID is not valid.',
            });
            return;
        }

        const model = await models.findByUuid(modelId);
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
