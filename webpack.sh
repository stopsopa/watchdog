
_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

node "$_ROOT/bash/node/versioncheck.js" --nvmrc .nvmrc --exact

if ! [ -f "$_ROOT/.env" ]; then

  cp "$_ROOT/.env.dist" "$_ROOT/.env"
fi

if ! [ -f "$_ROOT/.env" ]; then

  echo "$_ROOT/.env doesn't exist"

  exit
fi

function clean {

  cd "$_ROOT"
}

trap clean EXIT;

set -x
set -e

(
  cd "$_ROOT/public"
  if [ -e public ]; then echo 'dist symlink already exist'; else ln -s ../node_modules public; fi
)

#cd "$_ROOT"

mkdir -p override

#mkdir -p "$_ROOT/public/dist"
#if [ -e dist ]; then echo 'dist symlink already exist'; else ln -s ../public/dist dist; fi

node "$_ROOT/app/lib/buildtimer.js" # run only during build time

node "$_ROOT/app/lib/preprocessor.js" # run on server execution with fresh .env

if [ "$1" = "dev" ]; then

  export NODE_ENV="development"

  # https://webpack.js.org/guides/build-performance/#incremental-builds
  node node_modules/.bin/webpack --watch
else

  export NODE_ENV="production"

  node node_modules/.bin/webpack
fi





