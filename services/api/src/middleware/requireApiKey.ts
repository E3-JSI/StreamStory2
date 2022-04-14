import { Request, Response, NextFunction } from 'express';
import * as apiKeys from '../db/apiKeys';

async function requireApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    const apiKey = `${req.query.apiKey || ''}`;
    // check if token is valid- is in db and caller has same domain as provided in token

    if (apiKey && apiKey != null) {
        const apiKeyInDb = await apiKeys.findByValue(apiKey);

        if (apiKeyInDb) {
            console.log('apiKeyInDb=', apiKeyInDb);
            next();
            return;
        }

        console.log('api key not found in db');
    }

    res.status(401).json({
        error: ['unauthorized'],
    });
}

export default requireApiKey;
