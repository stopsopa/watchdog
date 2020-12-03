
if [ "$1" = "--getenvparam" ]; then

    printf "PROTECTED_KUB_CRONJOB_TIME_MEDIA";

    exit 0;
fi

python3 --version

set -e
set -x

cp /usr/src/envdir/.env /home/node/app/.env

echo -e "\n\n" >> /home/node/app/.env

cat /usr/src/onedrive/.env >> /home/node/app/.env

# im already in /home/node/app
#_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

source .env

set +e
set +x

if [ "$PROJECT_NAME_SHORT" = "" ]; then

  echo "$0 error: PROJECT_NAME_SHORT is not defined"

  exit 1
fi

set -e
set -x

function cleanup {

    sleep 600
}

trap cleanup EXIT

TARGETFILE="media-$(date +"%H_%M_%S").tar.gz"

(cd public/media/ && tar -zcvf "../../$TARGETFILE" images resources)

/bin/bash upload.sh --source "$TARGETFILE" --targetdir hubs/$PROJECT_NAME_SHORT/$(date +"%Y-%m-%d")

ls -lah

rm -rf "$TARGETFILE";

ls -lah

trap - EXIT

echo "PROTECTED_KUB_CRONJOB_WATCHDOG_MEDIA=>>$PROTECTED_KUB_CRONJOB_WATCHDOG_MEDIA<<"

if [ "$PROTECTED_KUB_CRONJOB_WATCHDOG_MEDIA" != "" ]; then

  set +e
  set +x

  curl "$PROTECTED_KUB_CRONJOB_WATCHDOG_MEDIA"
fi
