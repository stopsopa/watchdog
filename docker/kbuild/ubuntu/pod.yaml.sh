
_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )";

ROOT="$_DIR/../../..";

set -e
set -x

cd "$_DIR";

DOCTMP="$(/bin/bash "$ROOT/bash/envrender.sh" "$ROOT/.env" "$_DIR/pod.yaml" --clear --rmfirst -g "ubuntu-tmp")"

kubectl apply -f "$DOCTMP";

set +x
set +e

printf "\n\n    all good\n"







