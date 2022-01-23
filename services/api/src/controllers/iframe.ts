import { NextFunction, Request, Response } from 'express';
import * as models from '../db/models';
import { Model } from '../db/models';
import * as users from '../db/users';
import { TrainedModel } from '../lib/Modelling';

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

export async function getModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    const apiKey = "" + (req.query.apiKey || "")
    const user = await users.findByApiKey(apiKey);
    const modelId = Number(req.params.id);

    try {
        if(user == null) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }
        const model = await models.findById(modelId);

        if (!model || (user.id !== model.userId /*&& !model.public*/)) {
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

