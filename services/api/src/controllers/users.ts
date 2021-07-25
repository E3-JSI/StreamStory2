import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';

import { rememberMeCookie } from '../config/globals';
import * as users from '../db/users';
import { User, UserSettings } from '../db/users';
import { minPasswordLength } from './auth';

export interface UserResponse {
    // id: number;
    firstName: string;
    lastName: string;
    email: string;
    settings: UserSettings;
}

/**
 * Generate user response from user model.
 * @param user User model.
 * @returns User response object.
 */
export function getUserResponse(user: User): UserResponse {
    return {
        // id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        settings: user.settings
    };
}

export async function updateCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    // requireAuth middleware guarantees user is defined.
    const user = req.user as User;

    try {
        // TODO: form validation/sanitation (use: express-validation!?).
        if (req.body.theme !== undefined) {
            const success = await users.updateSettings(user.id, req.body);

            if (!success) {
                res.status(500).json({
                    error: ['settings_update_failed']
                });
                return;
            }

            // res.status(200).json({
            //     success
            // });
        } else if (req.body.firstName !== undefined) {
            const success = await users.updateDetails(
                user.id,
                req.body.firstName,
                req.body.lastName
            );

            if (!success) {
                res.status(500).json({
                    error: ['details_update_failed']
                });
                return;
            }

            // res.status(200).json({
            //     success
            // });
        } else if (req.body.oldPassword !== undefined) {
            const { oldPassword, newPassword, newPassword2 } = req.body;

            if (!(await bcrypt.compare(oldPassword, user.password))) {
                res.status(401).json({
                    error: {
                        oldPassword: 'invalid_password'
                    }
                });
                return;
            }

            if (oldPassword.length < minPasswordLength) {
                res.status(422).json({
                    error: {
                        oldPassword: 'short_password'
                    }
                });
                return;
            }

            if (newPassword !== newPassword2) {
                res.status(422).json({
                    error: {
                        newPassword2: 'password_mismatch'
                    }
                });
                return;
            }

            const success = await users.setPassword(user.id, newPassword);

            if (!success) {
                res.status(500).json({
                    error: ['password_update_failed']
                });
                return;
            }

            res.status(200).json({
                success
            });
            return;
        }

        res.status(200).json({
            user: getUserResponse((await users.findById(user.id)) as User)
        });
    } catch (err) {
        next(err);
    }
}

export async function deleteCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    // requireAuth middleware guarantees user is defined.
    const user = req.user as User;

    try {
        const success = users.del(user.id);

        if (!success) {
            res.status(500).json({
                error: ['account_deletion_failed']
            });
            return;
        }

        // Clear session.
        delete req.user;
        delete req.session.userId;

        // Clear cookie.
        if (req.cookies[rememberMeCookie.name]) {
            res.clearCookie(rememberMeCookie.name);
        }

        res.status(200).json({
            success
        });
    } catch (err) {
        next(err);
    }
}
