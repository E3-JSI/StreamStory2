import db from '../config/db';
import { rememberMeCookie, userTokenSize } from '../config/globals';
import getRandomString from '../utils/getRandomString';

// export interface Token {
//     id: number;
//     userId: number;
//     value: string;
//     createdAt: Date;
// }

// function getToken(row: QueryResultRow): Token {
//     return {
//         id: row.id,
//         userId: row.user_id,
//         value: row.value,
//         createdAt: row.created_at
//     };
// }

export async function consume(value: string): Promise<number> {
    const client = await db.connect();

    try {
        const { rows } = await client.query(
            `
            SELECT * FROM tokens
            WHERE value = $1;`,
            [value]
        );

        if (rows.length) {
            const { id, user_id: userId } = rows[0];

            // Remove found token and all expired tokens of current user from database.
            await client.query(
                `
                DELETE FROM tokens
                WHERE id = $1 OR user_id = $2 AND created_at < $3;`,
                [id, userId, new Date(Date.now() - rememberMeCookie.options.maxAge)]
            );

            return userId;
        }
    } finally {
        client.release();
    }

    return 0;
}

export async function save(value: string, userId: number): Promise<boolean> {
    const { rowCount } = await db.query(
        `
        INSERT INTO tokens(user_id, value)
        VALUES ($1, $2);`,
        [userId, value]
    );

    return rowCount > 0;
}

export async function issue(userId: number): Promise<string> {
    const token = getRandomString(userTokenSize);
    await save(token, userId);
    return token;
}
