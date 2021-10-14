import { Request, Response } from 'express';

function handleErrors(err: Error, req: Request, res: Response): void {
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    res.status(500).send({
        error: err.message,
    });
}

export default handleErrors;
