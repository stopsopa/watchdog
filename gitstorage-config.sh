#!/bin/bash

# used in
# git@github.com:stopsopa/watchdog.git

GITSTORAGESOURCE="git@bitbucket.org:stopsopa/gitstorage.git"

GITSTORAGETARGETDIR="watchdog"

GITSTORAGELIST=(
    ".env::$GITSTORAGETARGETDIR/.env"
    ".env.kub.test::$GITSTORAGETARGETDIR/.env.kub.test"
    "gitstorage-config.sh::$GITSTORAGETARGETDIR/gitstorage-config.sh"
    "sensitive.txt::$GITSTORAGETARGETDIR/sensitive.txt"
)
