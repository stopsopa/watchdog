#!/bin/bash

export MIGRATION_MODE=true

function cleanup {

    unset MIGRATION_MODE;
}

trap cleanup EXIT;

exec 3<> /dev/null
function red {
    printf "\e[91m$1\e[0m\n"
}
function green {
    printf "\e[32m$1\e[0m\n"
}
set -e
set -x

node info.js --bashfuse

_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

/bin/bash "$_DIR/link.sh"

TORUN="$(/bin/bash "$_DIR/torun.sh")";

if [ "$TORUN" = "0" ]; then

    { green "\n\nreverting:\n\n"; } 2>&3

    _DIRR="$(dirname "$_DIR")"

    cd "$_DIRR"

    # make mrevert
    (node "$_DIRR/node_modules/.bin/ts-node" "$_DIRR/node_modules/.bin/typeorm" migration:revert)

    cd "$_DIR"
fi

if [ "$TORUN" -lt "0" ]; then

    { red "\n\nnumber of executed migrations are ahead target by '$TORUN'\n\n"; } 2>&3

    exit 1
fi

{ green "\n\nexecuting last migration:\n\n"; } 2>&3

/bin/bash "$_DIR/mrun.sh"
