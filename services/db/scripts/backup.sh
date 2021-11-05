#!/bin/bash

# Create backup directory if neccessary
backup_path="$(dirname "$PGDATA")"/backup
mkdir -p $backup_path

# Create backup
pg_dump $POSTGRES_DB > $backup_path/$POSTGRES_DB"_`date +"%Y%m%d"`".sql
