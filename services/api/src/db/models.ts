import { QueryResultRow } from 'pg';

import db from '../config/db';

export interface Model {
    id: number;
    userId: number;
    username: string;
    name: string;
    description: string;
    dataset: string;
    online: boolean;
    active: boolean;
    public: boolean;
    createdAt: number;
    model?: string;
}

/**
 * Generate model object from data row.
 * @param row Data row.
 * @param metadata Indicates if only metadata should be included.
 * @returns Model object.
 */
function getModel(row: QueryResultRow, metadata = false): Model {
    const model = {
        id: row.id,
        userId: row.user_id,
        username: row.username,
        name: row.name,
        description: row.description,
        dataset: row.dataset,
        online: row.online,
        active: row.active,
        public: row.public,
        createdAt: (row.created_at as Date).getTime(),
    };

    return metadata
        ? model
        : {
              ...model,
              model: row.model,
          };
}

export async function findById(id: number): Promise<Model | null> {
    const { rows } = await db.query(
        `
        SELECT models.*, users.email AS username FROM models
        LEFT JOIN users ON models.user_id = users.id
        WHERE models.id = $1;`,
        [id]
    );

    if (!rows.length) {
        return null;
    }

    return getModel(rows[0]);
}

export async function get(userId: number, includePublic = false): Promise<Model[]> {
    const publicConstraint = includePublic ? ' OR models.public = true' : '';
    const { rows } = await db.query(
        `
        SELECT models.*, users.email AS username FROM models
        LEFT JOIN users ON models.user_id = users.id
        WHERE models.user_id = $1${publicConstraint};`,
        [userId]
    );

    return rows.map((row) => getModel(row, true));
}

export async function add(
    userId: number,
    name: string,
    description: string,
    dataset: string,
    online: boolean,
    model: string
): Promise<number> {
    const { rowCount, rows } = await db.query(
        `
        INSERT INTO models(user_id, name, description, dataset, online, active, public, model)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id;`,
        [userId, name, description, dataset, online, online, false, model],
    );
    return rowCount && rows[0].id;
}

export async function del(id: number): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        DELETE FROM models
        WHERE id = $1;`,
        [id]
    );

    if (!rowCount) {
        return false;
    }

    return true;
}

export async function setPublic(id: number, value: boolean): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        UPDATE models
        SET public = $1
        WHERE id = $2;`,
        [value, id]
    );

    if (!rowCount) {
        return false;
    }

    return true;
}

export async function setActive(id: number, value: boolean): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        UPDATE models
        SET active = $1
        WHERE id = $2;`,
        [value, id]
    );

    if (!rowCount) {
        return false;
    }

    return true;
}

export async function updateDescription(id: number, value: string): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        UPDATE models
        SET description = $1
        WHERE id = $2;`,
        [value, id]
    );

    if (!rowCount) {
        return false;
    }

    return true;
}