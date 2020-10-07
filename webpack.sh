
_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

_WEBPACKDIR="$_ROOT/webpack";

function clean {

  cd "$_ROOT"
}

trap clean EXIT;

set -x
set -e

(
  cd "$_ROOT/public"
  if [ -e public ]; then echo 'dist symlink already exist'; else ln -s ../webpack/node_modules public; fi
)

cd "$_WEBPACKDIR"

mkdir -p "$_ROOT/public/dist"
if [ -e dist ]; then echo 'dist symlink already exist'; else ln -s ../public/dist dist; fi

node roderic/preprocessor.js

export NODE_ENV="production"

if [ "$1" = "dev" ]; then

  export NODE_ENV="development"
fi

node node_modules/.bin/webpack

if [ "$1" = "dev" ]; then

node node_modules/.bin/onchange \
  'src/**/*.entry.jsx' \
  --exclude-path .prettierignore \
  -- \
  node node_modules/.bin/webpack

fi





