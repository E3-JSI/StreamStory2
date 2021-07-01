import { Request, Response } from 'express';

import { User } from '../db/users';

export interface UserResponse {
    email: string;
}

/**
 * Generate user response from user model.
 * @param user User model.
 * @returns User response object.
 */
export function getUserResponse(user: User): UserResponse {
    return {
        email: user.email
    };
}

export async function createUser(req: Request, res: Response): Promise<void> {
    // TODO
    res.status(404).json({ todo: req.url });
}

export async function getUser(req: Request, res: Response): Promise<void> {
    // TODO
    res.status(404).json({ todo: req.url });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
    // TODO
    res.status(404).json({ todo: req.url });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
    // TODO
    res.status(404).json({ todo: req.url });
}
