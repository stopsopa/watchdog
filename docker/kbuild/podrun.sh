
if [[ $1 != "" ]]; then

  while true
  do

    echo "netstat -anp --tcp | wc -l : $(netstat -anp --tcp | wc -l)" >> "$1"

    sleep 10

  done

  exit 0;
fi

FIND="$(cat ~/.bashrc | grep "#info")"

if [ "$FIND" = "" ]; then

cat <<-EOF >> ~/.bashrc

#info

cat <<-EEE

commands that you might need:

  source .env
  cd public/media/podslogs/

  grep 'Timeout acquiring a connection' * -rl
  grep 'Too many connections' * -rl

  printenv | grep -E "(DEP|GIT|BUILD|NODE_NAME)"

EEE

printenv | grep -E "(DEP|GIT|BUILD|NODE_NAME)"

echo ""

EOF

fi

cp /usr/src/envdir/.env /home/node/app/.env

_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

cd "$_DIR"

set -e
set -x

if [[ $NODE_NAME = "" ]]; then

  echo "$0 error: NODE_NAME is empty"

  exit 1
fi

if [[ $BUILD_NUMBER = "" ]]; then

  echo "$0 error: BUILD_NUMBER is empty"

  exit 1
fi

if [[ $DEPLOYMENT_TAG = "" ]]; then

  echo "$0 error: DEPLOYMENT_TAG is empty"

  exit 1
fi

if [[ $GIT_COMMIT = "" ]]; then

  echo "$0 error: GIT_COMMIT is empty"

  exit 1
fi

if [[ $HOSTNAME = "" ]]; then

  echo "$0 error: HOSTNAME is empty"

  exit 1
fi

source "$_DIR/.env"

if [[ $PROJECT_NAME_SHORT = "" ]]; then

  echo "$0 error: PROJECT_NAME_SHORT is empty"

  exit 1
fi

#DIR="$_DIR/public/media/podslogs/$PROJECT_NAME_SHORT"
#
#mkdir -p "$DIR"

#FILE="$DIR/$(date "+%Y-%m-%d__%H-%M-%S")--$HOSTNAME-b-$BUILD_NUMBER-g-$GIT_COMMIT-d-$DEPLOYMENT_TAG.log";

#/bin/bash "$_DIR/$0" "$FILE" & disown

#cd "$_DIR/react"

#node webpack.config.js
#
#node production/index.js prod | tee -a "$FILE"


cd /home/node/app

#cp .env.dist .env

(
  cd public
  if [ -e public ]; then echo 'dist symlink already exist'; else ln -s ../node_modules public; fi
)

source .env

(cd app && node lib/preprocessor.js)

export NODE_ENV="production"

node server.js

