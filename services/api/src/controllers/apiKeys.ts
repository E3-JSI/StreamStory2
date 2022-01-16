import { NextFunction, Request, Response } from 'express';

import * as apiKeys from '../db/apiKeys';
import { ApiKey } from '../db/apiKeys';
import { User, UserGroup } from '../db/users';

type ApiKeyResponse = ApiKey;

/**
 * Generate API key response from API key.
 * @param apiToken API Token.
 * @returns API key response object.
 */
function getApiKeyResponse(apiToken: ApiKey): ApiKeyResponse {
    const apiKeyResponse = apiToken;
    return apiKeyResponse;
}

export async function getApiKeys(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const userId = req.query.userId ? Number(req.query.userId) : user.id;

        if (user.id !== userId && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const apiTokenList = await apiKeys.get(userId);
        res.status(200).json({
            apiTokens: apiTokenList.map((apiToken) => getApiKeyResponse(apiToken)),
        });
    } catch (error) {
        next(error);
    }
}

export async function getApiKey(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const apiToken = await apiKeys.findById(id);

        if (apiToken && apiToken.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        res.status(200).json({
            apiToken: apiToken && getApiKeyResponse(apiToken),
        });
    } catch (error) {
        next(error);
    }
}

export async function addApiKey(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
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
        const id = await apiKeys.add(
            userId,
            value,
            domain
        );

        if (!id) {
            res.status(500).json({
                error: ['api_key_addition_failed'],
            });
            return;
        }

        // Return added api key.
        const apiToken = await apiKeys.findById(id);

        if (!apiToken) {
            res.status(500).json({
                error: ['db_query_failed'],
            });
            return;
        }

        res.status(200).json({
            apiToken: getApiKeyResponse(apiToken),
        });
    } catch (error) {
        next(error);
    }
}

export async function updateApiKey(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const apiToken = await apiKeys.findById(id);

        if (apiToken && apiToken.userId !== user.id && user.groupId !== UserGroup.Admin) {
            res.status(401).json({
                error: ['unauthorized'],
            });
            return;
        }

        const { domain } = req.body;

        // TODO: form validation/sanitation (use: express-validation!?).
        const success = apiKeys.update(
            id,
            domain
        );

        if (!success) {
            res.status(500).json({
                error: ['api_key_update_failed'],
            });
            return;
        }

        // Return updated API key.
        const updatedApiToken = await apiKeys.findById(id);

        if (!updatedApiToken) {
            res.status(500).json({
                error: ['db_query_failed'],
            });
            return;
        }

        res.status(200).json({
            apiToken: getApiKeyResponse(updatedApiToken),
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteApiKey(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const user = req.user as User;
        const id = Number(req.params.id);
        const apiToken = await apiKeys.findById(id);

        if (apiToken && apiToken.userId !== user.id && user.groupId !== UserGroup.Admin) {
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
