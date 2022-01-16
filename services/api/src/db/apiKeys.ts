import { QueryResultRow } from 'pg';

import db from '../config/db';

export interface ApiKey {
    id: number;
    userId: number;
    value: string;
    domain: string;
}

/**
 * Generate ApiKey object from data row.
 * @param row Data row.
 * @returns ApiKey object.
 */
function getApiKey(row: QueryResultRow): ApiKey {
    const apiKey = {
        id: row.id,
        userId: row.user_id,
        value: row.value,
        domain: row.domain,
    };

    return apiKey;
}

export async function findById(id: number): Promise<ApiKey | null> {
    const { rows } = await db.query(
        `
        SELECT * FROM api_keys
        WHERE id = $1;`,
        [id]
    );

    if (!rows.length) {
        return null;
    }

    return getApiKey(rows[0]);
}

export async function findByValue(value: string): Promise<ApiKey | null> {
    const { rows } = await db.query(
        `
        SELECT * FROM api_keys
        WHERE value = $1;`,
        [value]
    );

    if (!rows.length) {
        return null;
    }

    return getApiKey(rows[0]);
}

export async function get(userId: number): Promise<ApiKey[]> {
    const { rows } = await db.query(
        `
        SELECT * FROM api_keys
        WHERE user_id = $1;`,
        [userId]
    );
    return rows.map((row) => getApiKey(row));
}

export async function add(userId: number, value: string, domain: string): Promise<number> {
    const { rowCount, rows } = await db.query(
        `
        INSERT INTO api_keys(user_id, value, domain)
        VALUES ($1, $2, $3)
        RETURNING id;`,
        [userId, value, domain]
    );
    return rowCount && rows[0].id;
}

export async function update(id: number, domain: string): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        UPDATE api_keys
        SET domain = $1
        WHERE id = $2;`,
        [domain, id]
    );
    return rowCount > 0;
}

export async function del(id: number): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        DELETE FROM api_keys
        WHERE id = $1;`,
        [id]
    );
    return rowCount > 0;
}
