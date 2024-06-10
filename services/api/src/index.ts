import dotenv from 'dotenv';
import express from 'express';
// import * as helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import swaggerUi from 'swagger-ui-express';

import handleErrors from './middleware/handleErrors';
import handleUnknown from './middleware/handleUnknown';
import authenticateFromMemory from './middleware/authenticateFromMemory';
import apiRoutes from './routes/api';
import apiV1Routes from './routes/api/v1';
import db, { waitForDB } from './config/db';
import schedule from './lib/schedule';
import swaggerDocV1 from './openapi/v1/swagger';

async function main() {
    // Load environment variables (from .env file).
    dotenv.config();
    console.log(`Environment: ${process.env.NODE_ENV}`);

    console.log('Waiting for database...');
    await waitForDB();

    // Initialize express server.
    const app = express();

    // app.use(
    //     helmet.contentSecurityPolicy({
    //         useDefaults: true,
    //         directives: {
    //             'script-src': ["'self'", 'naiades.ijs.si', 'localhost:7000'],
    //         },
    //     })
    // );

    app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
    app.use(express.json());
    app.use(cookieParser());
    // app.use(express.urlencoded({ extended: false }));
    // app.use(flash());

    // Initialize sessions.
    const PgSession = pgSession(session);
    app.use(
        session({
            secret: process.env.SESSION_SECRET || 'secret',
            resave: false,
            saveUninitialized: false,
            store: new PgSession({
                pool: db,
                tableName: 'sessions',
            }),
        })
    );

    // Initialize session/cookie authentication.
    app.use(authenticateFromMemory);

    // Set up private API routing.
    app.use('/api', apiRoutes);
    
    // Set up public open API (v1) routes.
    app.use('/api/v1', apiV1Routes);
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocV1));

    // Handles unknown requests.
    app.all('/*', handleUnknown);

    // Handle uncaught errors.
    app.use(handleErrors);

    // Schedule tasks
    schedule();

    // Start up server.
    const port = Number(process.env.PORT || 8080);
    app.listen(port, () => {
        console.info(`Listening on port ${port}.`);
    });
}

// Start server.
main();
