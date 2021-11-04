#!/bin/bash

backup_path="$(dirname "$PGDATA")"/backup
latest_backup=$backup_path/$(ls $backup_path -Art | tail -n 1)
file=$([ -z "$1" ] && echo "$latest_backup" || echo "$1")

if [ -f $file ]; then
    dropdb $POSTGRES_DB
    createdb $POSTGRES_DB
    psql -d $POSTGRES_DB < $file
else
    echo "File $file not found" 1>&2
fi
