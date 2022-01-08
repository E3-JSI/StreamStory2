import { Request, Response, NextFunction } from 'express';

import { User, UserGroup } from '../db/users';

function requirePermission(req: Request, res: Response, next: NextFunction): void {
    const user = req.user as User;
    const userId = Number(req.params.userId);

    if (userId === user.id || user.groupId === UserGroup.Admin) {
        next();
        return;
    }

    res.status(401).json({
        error: ['unauthorized'],
    });
}

export default requirePermission;
