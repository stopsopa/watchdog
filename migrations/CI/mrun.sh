
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

_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

/bin/bash "$_DIR/link.sh"

set -e
set -x

node "$_DIR/info.js" $@

if [ ! -e "$_DIR/../ormconfig.js" ]; then

    { red "ormconfig.js doesn't exist, use template file ormconfig.js.dist"; } 2>&3

    exit 1;
fi

if [ ! -e "$_DIR/../node_modules" ]; then

    (cd ../ && yarn)
fi

TORUN="$(/bin/bash "$_DIR/torun.sh" $@)"

# don't stop if something goes wrong from now on - I can handle it
set +e

if [ "$TORUN" = "0" ]; then

    set +x

    { green "[OK]: No new migrations to execute"; } 2>&3

    exit 0;
fi

MCOUNT_BEFORE="$(node "$_DIR/mcountdb.js")"

(cd "$_DIR/.." && make -s migrate)

MCOUNT_AFTER="$(node "$_DIR/mcountdb.js")"

DIFF="$(($MCOUNT_AFTER - $MCOUNT_BEFORE))"

if [ "$MCOUNT_AFTER" = "$MCOUNT_BEFORE" ]; then

    { red "[ERROR]:After executing 'make -s migrate' number of migrations in db is the same - something is not quite right"; } 2>&3

    exit 1;
fi

if [ "$DIFF" != "$TORUN" ]; then

    { red "[ERROR]:Number of migrations in db before and after executing new migrations has changed from '$MCOUNT_BEFORE' to '$MCOUNT_AFTER', difference NOT match expected number of migrations to execute (diff should be '$TORUN' and is '$DIFF') - something is not ok, attempt to revert previous number of migrations"; } 2>&3

    MCOUNT_BEFORE_LOOP="$MCOUNT_AFTER"
    while true
    do
        (cd "$_DIR/.." && make -s mrevert)

        MCOUNT_AFTER_LOOP="$(node "$_DIR/mcountdb.js")"

        if [ "$MCOUNT_BEFORE_LOOP" = "$MCOUNT_AFTER_LOOP" ]; then

            { red "[ERROR]:Attempt to revert migration failed, number of migration after executing 'make mrevert' should decrease by one, but there is no change, entire loop should revert back migrations to '$MCOUNT_BEFORE' in database step by step - this loop failed"; } 2>&3

            exit 1
        fi

        if [ "$MCOUNT_AFTER_LOOP" = "$MCOUNT_BEFORE" ]; then

            { red"[ERROR]: It looks like reverting migrations has been completed successfully, throwing error though (exit code 100) for CI to stop"; } 2>&3

            exit 100
        fi
        
        { green "revert loop successful (MCOUNT_BEFORE_LOOP: $MCOUNT_BEFORE_LOOP -> MCOUNT_AFTER_LOOP: $MCOUNT_AFTER_LOOP)"; } 2>&3
        
        MCOUNT_BEFORE_LOOP="$MCOUNT_AFTER_LOOP"
    done

    exit 1;
fi

{ green "[OK]: Number of migrations in db before and after executing new migrations has changed from '$MCOUNT_BEFORE' to '$MCOUNT_AFTER', difference match expected number of migrations to execute - looks good, carry on"; } 2>&3

exit 0;