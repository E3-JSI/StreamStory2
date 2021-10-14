import { Request, Response } from 'express';

function handleUnknown(req: Request, res: Response): void {
    res.status(400).json({
        error: ['bad_request'],
    });
}

export default handleUnknown;
