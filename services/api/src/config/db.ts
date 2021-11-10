import { Pool } from 'pg';

const pool = new Pool({
    host: 'db',
    port: 5432,
    database: process.env.DB_NAME || 'streamstory',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
});

export async function waitForDB(): Promise<void> {
    let count = 1;
    let ready = false;

    while (!ready) {
        try {
            console.log(`Connecting to database... [${count}]`);

            // eslint-disable-next-line no-await-in-loop
            const client = await pool.connect();

            console.log('Connection to database established!');

            client.release();
            ready = true;
        } catch {
            // console.log('Connection to database failed!');
            count += 1;
        }
    }
}

export default pool;
