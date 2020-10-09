
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

source "$DIR/../bash/colours.sh"

source "$DIR/../.env"

if [ "$PROJECT_NAME" = "" ]; then

    { red "$0 error: environment variable missing 'PROJECT_NAME'"; } 2>&3

    exit 1;
fi

if [ "$PROTECTED_MYSQL_PASS" = "" ]; then

    { red "$0 error: environment variable missing 'PROTECTED_MYSQL_PASS'"; } 2>&3

    exit 1;
fi

set -x
TMP="$(/bin/bash ../bash/envrender.sh "$DIR/../.env" docker-compose.yml --clear -g "doc-up-tmp")"
set +x

if [ "$1" = "--help" ]; then

cat << EOF

  # to run container
  /bin/bash $0

  # to just generate config file
  /bin/bash $0 --gen

EOF

    exit 0;
fi

if [ "$1" = "--gen" ]; then

  echo "Config generated: $TMP"

  exit 0;
fi

#function cleanup {
#
#    printf "\n\n    cleanup...\n\n";
#
#    unlink "$TMP" || true
#}
#
#trap cleanup EXIT;

if [ "$1" = "up" ]; then

    docker-compose -f "$TMP" build
    docker-compose -f "$TMP" up -d --build

    MYSQL="mysql_${PROJECT_NAME}"

    if [ "$(docker inspect -f {{.State.Health.Status}} $MYSQL)" != "healthy" ]; then

      set +x

      printf "Waiting for status \"HEALTHY\": ";
      # https://stackoverflow.com/a/33520390/5560682
      until [ "$(docker inspect -f {{.State.Health.Status}} $MYSQL)" = "healthy" ]; do
          printf "."
          sleep 3;
      done;
      echo ""
      set -x

    fi

    echo "all good";

    exit 0;
fi

if [ "$1" = "stop" ]; then

    docker-compose -f "$TMP" stop

    exit 0;
fi