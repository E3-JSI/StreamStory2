FROM postgres:14.0-alpine3.14

ARG ROOT

# Install build dependencies
RUN apk add --no-cache supervisor

# Configure cron
RUN mkdir /etc/supervisor.d
COPY $ROOT/postgres_cron.ini /etc/supervisor.d/postgres_cron.ini

# Prepare scripts
COPY $ROOT/scripts ./scripts
RUN chmod +x ./scripts/*.sh

# Setup weekly backup
RUN cp ./scripts/backup.sh /etc/periodic/weekly/backup

# Run service
ENTRYPOINT ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
