#!/bin/bash



NITRO="0";

PARAMS=""
while (( "$#" )); do
  case "$1" in
    --nitro)
      NITRO="1";
      shift;
      ;;
    --) # end argument parsing
      shift;
      while (( "$#" )); do          # optional
        if [ "$1" = "&&" ]; then
          PARAMS="$PARAMS \&\&"
        else
          if [ "$PARAMS" = "" ]; then
            PARAMS="\"$1\""
          else
            PARAMS="$PARAMS \"$1\""
#          PARAMS="$(cat <<EOF
#$PARAMS
#- "$1"
#EOF
#)"
          fi
        fi
        shift;                      # optional
      done                          # optional if you need to pass: /bin/bash $0 -f -c -- -f "multi string arg"
      break;
      ;;
    -*|--*=) # unsupported flags
      echo "$0 Error: Unsupported flag $1" >&2
      exit 1;
      ;;
    *) # preserve positional arguments
      if [ "$1" = "&&" ]; then
          PARAMS="$PARAMS \&\&"
      else
        if [ "$PARAMS" = "" ]; then
            PARAMS="\"$1\""
        else
          PARAMS="$PARAMS \"$1\""
        fi
      fi
      shift;
      ;;
  esac
done

trim() {
    local var="$*"
    # remove leading whitespace characters
    var="${var#"${var%%[![:space:]]*}"}"
    # remove trailing whitespace characters
    var="${var%"${var##*[![:space:]]}"}"
    echo -n "$var"
}

PARAMS="$(trim "$PARAMS")"

eval set -- "$PARAMS"






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

/bin/bash "$_DIR/link.sh"

cd "$_DIR"

exec 3<> /dev/null
function red {
    printf "\e[91m$1\e[0m\n"
}
function green {
    printf "\e[32m$1\e[0m\n"
}
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

    if [ "$NITRO" = "1" ]; then

      (cd "$_DIR/.." && node CI/nitro/migrate.js revert)
    else

      (cd .. && node node_modules/.bin/ts-node node_modules/.bin/typeorm migration:revert)
    fi

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

  if [ "$NITRO" = "1" ]; then

    /bin/bash "$_DIR/mrun.sh" --nitro
  else

    /bin/bash "$_DIR/mrun.sh"
  fi

  exit 0;
fi

CURRENTAFTER="$(node "$_DIR/info.js" --current)"

if [ "$CURRENTAFTER" != "$TARGET" ]; then

  { red "\n   after executing script desired number of triggered migration doesn't match existing state (TARGET: $TARGET, CURRENTAFTER: $CURRENTAFTER)\n"; } 2>&3

  exit 1
fi


{ green "\n   All good: TARGET: $TARGET, TOTAL: $TOTAL, DONE: $DONE\n"; } 2>&3

exit 0



