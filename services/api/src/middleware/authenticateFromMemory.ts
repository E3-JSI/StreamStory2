import { NextFunction, Request, Response } from 'express';

import * as users from '../db/users';
import * as tokens from '../db/tokens';
import { rememberMeCookie } from '../config/const';

export async function authenticateFromMemory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    if (req.user) {
        next();
        return;
    }

    // Try to authenticate user from session.
    if (req.session.userId) {
        try {
            const user = await users.findById(req.session.userId);

            if (user) {
                req.user = user;
                await users.updateLastLogin(user.id);

                next();
                return;
            }
        } catch (error) {
            next(error);
            return;
        }
    }

    // Try to authenticate user from cookie.
    const token = req.cookies[rememberMeCookie.name];
    if (token) {
        try {
            const userId = await tokens.consume(token);

            if (!userId) {
                next();
                return;
            }

            const user = await users.findById(userId);

            if (!user) {
                // Delete invalid token.
                res.clearCookie(rememberMeCookie.name);

                next();
                return;
            }

            req.user = user;
            req.session.userId = user.id;
            await users.updateLastLogin(user.id);

            // Issue new token.
            const newToken = await tokens.issue(userId);
            res.cookie(rememberMeCookie.name, newToken, rememberMeCookie.options);
        } catch (error) {
            next(error);
            return;
        }
    }

    next();
}

export default authenticateFromMemory;
