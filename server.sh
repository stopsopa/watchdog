
set -x
set -e

_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

node "$_ROOT/bash/node/versioncheck.js" --nvmrc .nvmrc

if ! [ -f "$_ROOT/.env" ]; then

  echo "$_ROOT/.env doesn't exist"

  exit 1
fi

source "$_ROOT/.env"

/bin/bash testport.sh

node app/lib/buildtimer.js

yarn add open-cli

#node "$_ROOT/node_modules/.bin/open-cli" http://0.0.0.0:$NODE_PORT
sleep 6 && node "$_ROOT/node_modules/.bin/open-cli" http://0.0.0.0:$NODE_PORT &

export NODE_ENV="development"

nodemon --ignore public/dist --ignore var -- server.js --verbose