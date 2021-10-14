import { Request, Response, NextFunction } from 'express';

function requireAuth(req: Request, res: Response, next: NextFunction): void {
    if (req.user) {
        next();
        return;
    }

    res.status(401).json({
        error: ['unauthorized'],
    });
}

export default requireAuth;
