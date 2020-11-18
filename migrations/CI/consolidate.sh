#!/bin/bash

exec 3<> /dev/null
function red {
    printf "\e[91m$1\e[0m\n"
}
function green {
    printf "\e[32m$1\e[0m\n"
}

TRAPS=()

function trigger_traps {

  for i in "${TRAPS[@]}"
  do

      { yellow "\ntriggering trap: '$i'"; } 2>&3

      $i || true
  done
}

trap trigger_traps EXIT;

export MIGRATION_MODE=true

function un {

    unset MIGRATION_MODE;
}

TRAPS+=('un')

_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

#/bin/bash "$_DIR/link.sh"

node "$_DIR/consolidate.js" --bashfuse

exit 0

cd "$_DIR"
#set -e
#set -x

TARGET="$1"

TEST="^[0-9]+$"

if ! [[ $TARGET =~ $TEST ]]; then

  { red "\n   TARGET should match $TEST but it is '$TARGET'\n"; } 2>&3

  exit 1
fi

node "$_DIR/info.js" --bashfuse

TOTAL="$(node "$_DIR/info.js" --total)"

if [[ "$TARGET" -gt "$TOTAL" ]]; then

  { red "\n   TARGET ($TARGET) should not be bigger than TOTAL ($TOTAL)\n"; } 2>&3

  exit 1
fi

if [[ "$TARGET" -lt "1" ]]; then

  { red "\n   TARGET ($TARGET) should not be smallert than 1\n"; } 2>&3

  exit 1
fi

CURRENT="$(node "$_DIR/info.js" --current)"

if ! [[ $CURRENT =~ $TEST ]]; then

  { red "\n   CURRENT should match $TEST but it is '$CURRENT'\n"; } 2>&3

  exit 1
fi

DIFF=$(($TARGET - $CURRENT))

DONE="nothing";

if [ "$DIFF" -lt "0" ]; then

  LOOP=$((0 - $DIFF))

  DONE="reverted $LOOP migrations";

  COUNTER=1
  while [  $COUNTER -le $LOOP ]; do

    { green "\n>>> reverting: $COUNTER of $LOOP <<<"; } 2>&3

#    (cd .. && make mrevert)
#    (cd .. && node node_modules/.bin/ts-node node_modules/.bin/typeorm migration:revert)
    (cd .. && node CI/nitro/migrate.js revert)

    let COUNTER=COUNTER+1;
  done
fi

if [ "$DIFF" -gt "0" ]; then

  function cleanup {

      { green "\n\ncleanup...\n\n"; } 2>&3

      node "$_DIR/info.js" --move-back
  }

  TRAPS+=('cleanup')

  node "$_DIR/info.js" --move-back

  node "$_DIR/info.js" --move-files-before-movesh $TARGET

  DONE="execute $DIFF migrations";

  /bin/bash "$_DIR/mrun.sh" --nitro

  exit 0;
fi

CURRENTAFTER="$(node "$_DIR/info.js" --current)"

if [ "$CURRENTAFTER" != "$TARGET" ]; then

  { red "\n   after executing script desired number of triggered migration doesn't match existing state (TARGET: $TARGET, CURRENTAFTER: $CURRENTAFTER)\n"; } 2>&3

  exit 1
fi


{ green "\n   All good: TARGET: $TARGET, TOTAL: $TOTAL, DONE: $DONE\n"; } 2>&3

exit 0



