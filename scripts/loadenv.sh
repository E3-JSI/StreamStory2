#!/bin/bash

file=$([ -z "$1" ] && echo ".env" || echo "$1")

if [ -f $file ]; then
    set -a
    source $file
    set +a
else
    echo "File $file not found" 1>&2
fi
