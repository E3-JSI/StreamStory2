# Development

How to run StreamStory locally with hot reloading. For the big picture, see
[architecture.md](architecture.md).

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (used to install dependencies and drive the compose commands)

## Setup

```bash
# 1. Fork on GitHub, then clone your fork
git clone https://github.com/<your-username>/StreamStory2.git
cd StreamStory2

# 2. Create the local env file (dev defaults, MailHog, dev ports)
cp .env.development .env

# 3. Install dependencies for every service
npm install

# 4. Build the development images
npm run build:dev

# 5. Start the stack
npm run start:dev
```

Open `http://localhost:3000`. Sent e-mails (activation, password reset) are
caught by MailHog at `http://localhost:8025` — nothing leaves your machine.

## Ports

| URL                     | Service |
|-------------------------|---------|
| http://localhost:3000   | client (React dev server) |
| http://localhost:3001   | api |
| http://localhost:3002   | data (time-series provider) |
| http://localhost:8025   | MailHog web UI |
| localhost:5432          | PostgreSQL |
| http://localhost:8096   | modelling |

Override any of these with the `*_PORT` variables in `.env`.

## Everyday commands

```bash
npm run start:dev   # start (detached)
npm run log         # follow logs of all services
```

To stop the stack without losing data:

```bash
docker-compose -f docker-compose.dev.yml -p streamstory down
```

> **Careful:** `npm run stop` runs `down --remove-orphans -v`, which also
> **deletes the `data` volume** — every uploaded dataset and built model. Use it
> only when you want a clean slate.

The dev containers mount the source directories, so changes to `services/*/src`
reload automatically. Editing `package.json` or Dockerfiles needs a rebuild
(`npm run build:dev`).

## Code style

The api and client use ESLint, Prettier, and Jest. Run them inside a service
directory, e.g.:

```bash
cd services/api
npm run lint
npm run format
npm test
```

## Project layout

```
services/
  api/         Express + TypeScript backend (private and public API)
  client/      React frontend
  modelling/   C++/qminer model builder (ss2 binary)
  data/        Auxiliary time-series service (development)
  db/          PostgreSQL image, schema and upgrade scripts
configs/        Per-environment config templates (development, production)
scripts/        Build helpers (loadenv.sh, setupConfig.js)
docs/           This documentation
```

## Contributing

Create a feature branch off `main`, commit, push to your fork, and open a pull
request against `E3-JSI/StreamStory2` `main`.
