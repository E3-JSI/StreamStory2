import { QueryResultRow } from 'pg';

import db from '../config/db';

export interface Notification {
    id: number;
    userId: number;
    modelId: number;
    type: string;
    title: string;
    content: string;
    time: number;
    read: boolean;
}

/**
 * Generate Notification object from data row.
 * @param row Data row.
 * @returns Notification object.
 */
function getNotification(row: QueryResultRow): Notification {
    const notification = {
        id: row.id,
        userId: row.user_id,
        modelId: row.model_id,
        type: row.type,
        title: row.title,
        content: row.content,
        time: (row.time as Date).getTime(),
        read: row.read,
    };

    return notification;
}

export async function findById(id: number): Promise<Notification | null> {
    const { rows } = await db.query(
        `
        SELECT * FROM notifications
        WHERE id = $1;`,
        [id]
    );

    if (!rows.length) {
        return null;
    }

    return getNotification(rows[0]);
}

export async function get(userId: number, unread = false): Promise<Notification[]> {
    const condition = unread ? ' and read = false' : '';
    const { rows } = await db.query(
        `
        SELECT * FROM notifications
        WHERE user_id = $1${condition};`,
        [userId]
    );
    return rows.map((row) => getNotification(row));
}

export async function add(
    userId: number,
    modelId: number,
    type: string,
    title: string,
    content: string
): Promise<number> {
    const { rowCount, rows } = await db.query(
        `
        INSERT INTO notifications(user_id, model_id, type, title, content)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;`,
        [userId, modelId, type, title, content]
    );
    return Number(rowCount) > 0 && rows[0].id;
}

export async function update(id: number, read: boolean): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        UPDATE notifications
        SET read = $1
        WHERE id = $2;`,
        [read, id]
    );
    return Number(rowCount) > 0;
}

export async function del(id: number): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        DELETE FROM notifications
        WHERE id = $1;`,
        [id]
    );
    return Number(rowCount) > 0;
}
