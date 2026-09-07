# Deployment

Production runs from [docker-compose.yml](../docker-compose.yml), which publishes
only the client and keeps the api, database, and modelling service on an internal
network. See [architecture.md](architecture.md) for the full picture.

## 1. Configuration

Pick or edit an environment under [configs/](../configs) (`production` by
default). `config.json` there holds the site URL, sender address, mail relay, and
optional OAuth providers, with `$VARIABLES` filled from `.env` at build time.

```jsonc
// configs/production/config.json
{
  "url": "http://streamstory.ijs.si",
  "email": "streamstory@ijs.si",
  "mailer": { "host": "mail.ijs.si", "port": 25 }
}
```

## 2. Environment variables

Create `.env` (start from [.env.production](../.env.production)):

| Variable         | Purpose |
|------------------|---------|
| `SESSION_SECRET` | Secret used to sign session cookies. Set a long random value. |
| `DB_PASSWORD`    | PostgreSQL password for user `root`. |
| `CLIENT_PORT`    | Host port the client is published on (default 80). |

If the chosen `config.json` references additional `$VARIABLES` (for example an
OAuth provider's client secret), add those to `.env` as well.

## 3. Build and run

```bash
npm install
npm run build --config=production   # bakes configs/production into the images
npm run start                       # docker-compose up -d
npm run log                         # follow logs
```

`--config=<name>` selects the directory under `configs/`. Because configuration
is compiled into the images, **rebuild after changing `config.json` or `.env`.**

## 4. Data persistence and backups

- PostgreSQL data is bind-mounted to `services/db/data`. The schema in
  [services/db/schema](../services/db/schema) runs automatically **only on the
  first start** (when the data directory is empty).
- Schema changes for an already-initialised database live as numbered scripts in
  [services/db/upgrade](../services/db/upgrade) (mounted read-only at `/upgrade`).
  They are **not** applied automatically — run the ones you need by hand:

  ```bash
  docker-compose -p streamstory exec db \
    psql -U root -d streamstory -f /upgrade/00X_name.sql
  ```

- Uploaded datasets and built models live in the named `data` volume, shared
  between the api and modelling services.
- The db container runs a **weekly `pg_dump`** (cron via supervisord) into
  `services/db/data/backup/`. That is a local convenience, not an offsite backup —
  copy `services/db/data` (database plus dumps) and the `data` volume somewhere
  safe on your own schedule.

## 5. Outgoing e-mail and TLS

The api sends account-activation and password-reset e-mail through the relay in
`config.json`. When the relay offers STARTTLS, Node must trust its certificate
chain. The api container mounts the host CA bundle and points Node at it:

```yaml
# docker-compose.yml (api service)
volumes:
  - /etc/ssl/certs/ca-certificates.crt:/etc/ssl/certs/ca-certificates.crt:ro
environment:
  NODE_EXTRA_CA_CERTS: /etc/ssl/certs/ca-certificates.crt
```

Keep the host `ca-certificates` package current. If registration succeeds but no
e-mail arrives, check the api logs for TLS or relay errors
(`npm run log`, look for the mail send).

## 6. Updating

```bash
git pull
npm run build --config=production
npm run start                       # recreates changed containers
```

To recreate a single service without touching the rest (e.g. after an api-only
change), use `docker-compose -p streamstory up -d --no-deps api`.
