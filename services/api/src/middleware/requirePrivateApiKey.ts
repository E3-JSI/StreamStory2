import { Request, Response, NextFunction } from 'express';
import { findByValue } from '../db/apiKeys';
import { findById } from '../db/users';

async function requirePrivateApiKey(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const apiKeyHeader = req.headers['x-api-key'];
    const apiKeyValue = apiKeyHeader ? String(apiKeyHeader) : '';
    if (!apiKeyValue) {
        res.status(400).json({
            error: 'Missing API key.',
        });
        return;
    }

    const apiKey = await findByValue(apiKeyValue);
    if (apiKey) {
        const user = await findById(apiKey.userId);
        if (user) {
            req.user = user;
            next();
            return;
        }
    }

    res.status(401).json({
        error: 'Invalid API key.',
    });
}

export default requirePrivateApiKey;
