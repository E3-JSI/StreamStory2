import { QueryResultRow } from 'pg';

import db from '../config/db';

export interface DataSource {
    id: number;
    userId: number;
    name: string;
    description: string;
    url: string;
    timeWindowStart: number;
    timeWindowEnd: number;
    interval: number;
}

/**
 * Generate DataSource object from data row.
 * @param row Data row.
 * @returns DataSource object.
 */
function getDataSource(row: QueryResultRow): DataSource {
    const dataSource = {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        url: row.url,
        timeWindowStart: (row.time_window_start as Date).getTime(),
        timeWindowEnd: (row.time_window_end as Date).getTime(),
        interval: row.interval,
    };

    return dataSource;
}

export async function findById(id: number): Promise<DataSource | null> {
    const { rows } = await db.query(
        `
        SELECT * FROM datasources
        WHERE id = $1;`,
        [id]
    );

    if (!rows.length) {
        return null;
    }

    return getDataSource(rows[0]);
}

export async function get(userId: number): Promise<DataSource[]> {
    const { rows } = await db.query(
        `
        SELECT * FROM datasources
        WHERE user_id = $1;`,
        [userId]
    );
    return rows.map((row) => getDataSource(row));
}

export async function add(
    userId: number,
    name: string,
    description: string,
    url: string,
    timeWindowStart: number,
    timeWindowEnd: number,
    interval: number
): Promise<number> {
    const { rowCount, rows } = await db.query(
        `
        INSERT INTO datasources(user_id, name, description, url, time_window_start, time_window_end, interval)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;`,
        [
            userId,
            name,
            description,
            url,
            new Date(timeWindowStart),
            new Date(timeWindowEnd),
            interval,
        ]
    );
    return Number(rowCount) > 0 && rows[0].id;
}

export async function update(
    id: number,
    name: string,
    description: string,
    url: string,
    timeWindowStart: number,
    timeWindowEnd: number,
    interval: number
): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        UPDATE datasources
        SET name = $1,
            description = $2,
            url = $3,
            time_window_start = $4,
            time_window_end = $5,
            interval = $6
        WHERE id = $7;`,
        [name, description, url, new Date(timeWindowStart), new Date(timeWindowEnd), interval, id]
    );
    return Number(rowCount) > 0;
}

export async function del(id: number): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        DELETE FROM datasources
        WHERE id = $1;`,
        [id]
    );
    return Number(rowCount) > 0;
}
