import bcrypt from 'bcryptjs';
import { QueryResultRow } from 'pg';

import { salt } from '../config/globals';
import db from '../config/db';

export interface UserSettings {
    [key: string]: unknown;
}

export interface User {
    id: number;
    groupId: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    active: boolean;
    settings: UserSettings;
    createdAt: Date;
    lastLogin: Date;
}

function getUser(row: QueryResultRow): User {
    return {
        id: row.id,
        groupId: row.group_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        password: row.password,
        active: row.active,
        settings: row.settings,
        createdAt: row.created_at,
        lastLogin: row.last_login
    };
}

export async function findById(id: number): Promise<User | null> {
    const { rows } = await db.query(
        `
        SELECT * FROM users
        WHERE id = $1;`,
        [id]
    );

    if (!rows.length) {
        return null;
    }

    return getUser(rows[0]);
}

export async function findByEmail(email: string): Promise<User | null> {
    const { rows } = await db.query(
        `
        SELECT * FROM users
        WHERE email = $1;`,
        [email]
    );

    if (!rows.length) {
        return null;
    }

    return getUser(rows[0]);
}

export async function updateLastLogin(id: number): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        UPDATE users
        SET last_login = $1
        WHERE id = $2;`,
        [new Date(), id]
    );
    return rowCount > 0;
}

export async function add(
    groupId: number,
    email: string,
    password: string,
    settings: UserSettings
): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(password, salt);
    const { rowCount } = await db.query(
        `
        INSERT INTO users(group_id, email, password, settings)
        VALUES ($1, $2, $3, $4);`,
        [groupId, email, hashedPassword, settings]
    );
    return rowCount > 0;
}

export async function del(id: number): Promise<boolean> {
    const client = await db.connect();

    try {
        await client.query(
            `
            DELETE FROM tokens
            WHERE user_id = $1;`,
            [id]
        );
        const { rowCount } = await client.query(
            `
            DELETE FROM users
            WHERE id = $1;`,
            [id]
        );

        if (!rowCount) {
            return false;
        }
    } finally {
        client.release();
    }

    return true;
}

export async function activate(token: string): Promise<boolean> {
    const client = await db.connect();

    try {
        const { rows } = await client.query(
            `
            SELECT id FROM users
            WHERE settings->>'activation' = $1;`,
            [token]
        );

        if (!rows.length) {
            return false;
        }

        const { id } = rows[0];
        const { rowCount } = await client.query(
            `
            UPDATE users
            SET active = $1,
                settings = $2
            WHERE id = $3;`,
            [true, {}, id]
        );

        if (!rowCount) {
            return false;
        }
    } finally {
        client.release();
    }

    return true;
}

export async function setPasswordResetToken(id: number, token: string): Promise<boolean> {
    const client = await db.connect();

    try {
        const { rows } = await client.query(
            `
            SELECT settings FROM users
            WHERE id = $1;`,
            [id]
        );

        if (!rows.length) {
            return false;
        }

        const { settings } = rows[0];
        settings.passwordReset = {
            token,
            createdAt: new Date()
        };

        const { rowCount } = await client.query(
            `
            UPDATE users
            SET settings = $1
            WHERE id = $2;`,
            [settings, id]
        );

        if (!rowCount) {
            return false;
        }
    } finally {
        client.release();
    }

    return true;
}

export async function resetPassword(token: string, password: string): Promise<boolean> {
    const client = await db.connect();

    try {
        const { rows } = await client.query(
            `
            SELECT id, settings FROM users
            WHERE settings->'passwordReset'->>'token' = $1`,
            [token]
        );

        if (!rows.length) {
            return false;
        }

        const { id, settings } = rows[0];
        const createdAt = new Date(settings.passwordReset.createdAt);
        const expired = (Date.now() - createdAt.getTime()) / 3600000 >= 24;

        if (expired) {
            return false;
        }

        delete settings.passwordReset;

        const hashedPassword = await bcrypt.hash(password, salt);
        const { rowCount } = await client.query(
            `
            UPDATE users
            SET password = $1,
                settings = $2
            WHERE id = $3`,
            [hashedPassword, settings, id]
        );

        if (!rowCount) {
            return false;
        }
    } finally {
        client.release();
    }

    return true;
}

export async function setPassword(id: number, password: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(password, salt);
    const { rowCount } = await db.query(
        `
        UPDATE users
        SET password = $1
        WHERE id = $2`,
        [hashedPassword, id]
    );
    return rowCount > 0;
}

export async function updateDetails(
    id: number,
    firstName: string,
    lastName: string
): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        UPDATE users
        SET first_name = $1,
            last_name = $2
        WHERE id = $3`,
        [firstName, lastName, id]
    );
    return rowCount > 0;
}

export async function updateSettings(id: number, newSettings: UserSettings): Promise<boolean> {
    const client = await db.connect();

    try {
        const { rows } = await client.query(
            `
            SELECT settings FROM users
            WHERE id = $1`,
            [id]
        );

        if (!rows.length) {
            return false;
        }

        const { settings } = rows[0];
        const { rowCount } = await client.query(
            `
            UPDATE users
            SET settings = $1
            WHERE id = $2`,
            [{ ...settings, ...newSettings }, id]
        );

        if (!rowCount) {
            return false;
        }
    } finally {
        client.release();
    }

    return true;
}
