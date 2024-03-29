import { NextFunction, Request, Response } from 'express';

import * as apiKeys from '../db/apiKeys';
import { ApiKey } from '../db/apiKeys';
import { User, UserGroup } from '../db/users';

type ApiKeyResponse = ApiKey;

/**
 * Generate API key response from API key.
 * @param apiKey API Token.
 * @returns API key response object.
 */
function getApiKeyResponse(apiKey: ApiKey): ApiKeyResponse {
    const apiKeyResponse = apiKey;
    return apiKeyResponse;
}

export async function getApiKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = req.user as User;
        const userId = req.query.userId ? Number(req.query.userId) : user.id;

        if (user.id !== userId && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const apiKeyList = await apiKeys.get(userId);
        res.status(200).json({
            apiKeys: apiKeyList.map((apiKey) => getApiKeyResponse(apiKey)),
        });
    } catch (error) {
        next(error);
    }
}

export async function getApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const apiKey = await apiKeys.findById(id);

        if (apiKey && apiKey.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        res.status(200).json({
            apiKey: apiKey && getApiKeyResponse(apiKey),
        });
    } catch (error) {
        next(error);
    }
}

export async function addApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = req.user as User;
        const userId = req.body.userId ? Number(req.body.userId) : user.id;

        if (user.id !== userId && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const { value, domain } = req.body;

        // TODO: form validation/sanitation (use: express-validation!?).
        const id = await apiKeys.add(userId, value, domain);

        if (!id) {
            res.status(500).json({
                error: ['api_key_addition_failed'],
            });
            return;
        }

        // Return added api key.
        const apiKey = await apiKeys.findById(id);

        if (!apiKey) {
            res.status(500).json({
                error: ['db_query_failed'],
            });
            return;
        }

        res.status(200).json({
            apiKey: getApiKeyResponse(apiKey),
        });
    } catch (error) {
        next(error);
    }
}

export async function updateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const apiKey = await apiKeys.findById(id);

        if (apiKey && apiKey.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const { domain } = req.body;

        // TODO: form validation/sanitation (use: express-validation!?).
        const success = apiKeys.update(id, domain);

        if (!success) {
            res.status(500).json({
                error: ['api_key_update_failed'],
            });
            return;
        }

        // Return updated API key.
        const updatedApiKey = await apiKeys.findById(id);

        if (!updatedApiKey) {
            res.status(500).json({
                error: ['db_query_failed'],
            });
            return;
        }

        res.status(200).json({
            apiKey: getApiKeyResponse(updatedApiKey),
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const apiKey = await apiKeys.findById(id);

        if (apiKey && apiKey.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const success = await apiKeys.del(id);

        if (!success) {
            res.status(500).json({
                error: ['api_key_deletion_failed'],
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
