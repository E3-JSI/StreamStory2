import express from 'express';
import morgan from 'morgan';

import handleErrors from './middleware/handleErrors';
import handleUnknown from './middleware/handleUnknown';
import routes from './routes';

function main() {
    console.log(`Environment: ${process.env.NODE_ENV}`);

    // Initialize express server.
    const app = express();
    app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
    app.use(express.json({ limit: '10gb' }));

    // Set up routing.
    app.use(routes);

    // Prevent favicon 404.
    app.get('/favicon.ico', (req, res) => res.status(204).end());

    // Handles unknown requests.
    app.all('/*', handleUnknown);

    // Handle uncaught errors.
    app.use(handleErrors);

    // Start up server.
    const port = Number(process.env.PORT || 8081);
    app.listen(port, () => {
        console.info(`Listening on port ${port}.`);
    });
}

// Start server.
main();
