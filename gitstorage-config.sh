#!/bin/bash

GITSTORAGESOURCE="git@bitbucket.org:phaseii/doc.git"

GITSTORAGETARGETDIR="pii-watchdog"

GITSTORAGELIST=(
    ".env::$GITSTORAGETARGETDIR/.env"
    ".env.kub.test::$GITSTORAGETARGETDIR/.env.kub.test"
    "gitstorage-config.sh::$GITSTORAGETARGETDIR/gitstorage-config.sh"
)
