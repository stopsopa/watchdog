
_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

_WEBPACKDIR="$_ROOT/webpack";

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

#cd "$_WEBPACKDIR"

mkdir -p override

#mkdir -p "$_ROOT/public/dist"
#if [ -e dist ]; then echo 'dist symlink already exist'; else ln -s ../public/dist dist; fi

node "$_WEBPACKDIR/roderic/preprocessor.js"

export NODE_ENV="production"

if [ "$1" = "dev" ]; then

  export NODE_ENV="development"
fi

if [ "$1" = "dev" ]; then

#node "$_ROOT/node_modules/.bin/onchange" \
#  '**/*.js' \
#  '**/*.jsx' \
#  '**/*.html' \
#  '**/*.css' \
#  '**/*.scss' \
#  --exclude-path "$_ROOT/.prettierignore" \
#  -- \
#  node "$_ROOT/node_modules/.bin/webpack" \
#   --config "$_WEBPACKDIR/webpack.config.js"

# https://webpack.js.org/guides/build-performance/#incremental-builds
node "$_ROOT/node_modules/.bin/webpack" \
   --watch \
   --info-verbosity verbose \
   --config "$_WEBPACKDIR/webpack.config.js"

#   --progress \

fi





