#!/bin/bash

export MIGRATION_MODE=true

function cleanup {

    unset MIGRATION_MODE;
}

trap cleanup EXIT;

# Return number of migration that should be executed agains db
# Might be negative value, in this case it will mean how many migrations have to be reverted

exec 3<> /dev/null
function red {
    printf "\e[91m$1\e[0m\n"
}
function green {
    printf "\e[32m$1\e[0m\n"
}
set -e

_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

/bin/bash "$_DIR/link.sh"

node "$_DIR/info.js" --silent

MIGRATIONFILES="$(/bin/bash "$_DIR/target.sh")"

MIGRATIONSINDB="$(node "$_DIR/mcountdb.js")"

#echo ">>>DB: $MIGRATIONSINDB - FI: $MIGRATIONFILES<<<"

DIFF="$(($MIGRATIONFILES - $MIGRATIONSINDB))"

TEST="^-?[0-9]+$"

if ! [[ "$DIFF" =~ $TEST ]]; then

    { red "DIFF ($DIFF) didn't match '$TEST'"; } 2>&3

    exit 1;
fi

printf $DIFF




