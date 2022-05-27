#!/usr/bin/env bash

ON_TRIGGER="curl localhost:3030/start &> /dev/null"
OFF_TRIGGER="curl localhost:3030/stop &> /dev/null"
LOCKFILE=/tmp/dc-ptt.lock
CURRENT_TIME=$(date +%s%3N)

if [ ! -f "$LOCKFILE" ]; then
    sh -c "$ON_TRIGGER" &
    sleep 0.5s
fi

echo "$CURRENT_TIME" > "$LOCKFILE"

sleep 0.3s
CONTENT=$(cat "$LOCKFILE")
if [ "$CURRENT_TIME" == "$CONTENT" ]; then
    rm "$LOCKFILE"
    sh -c "$OFF_TRIGGER"
fi
