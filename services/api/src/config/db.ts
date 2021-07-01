import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'db',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || 'streamstory',
    user: process.env.POSTGRES_USER || 'root',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: false
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
        } catch (err) {
            // console.log('Connection to database failed!');
            count += 1;
        }
    }
}

export default pool;
