
_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

_WEBPACKDIR="$_ROOT/webpack";

function clean {

  cd "$_ROOT"
}

trap clean EXIT;

cd "$_WEBPACKDIR"

set -x
set -e

mkdir -p "$_ROOT/public/dist"
ln -s ../public/dist dist || true

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





