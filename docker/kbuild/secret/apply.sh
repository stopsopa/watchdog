
_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

_ROOT="$_DIR/../../.."

if [ "$1" = "" ]; then

  (cd "$_ROOT" && find . -type f -maxdepth 1 | grep ".env.kub.")

  exit 1;
fi

ENVFILE="$_DIR/../../../$1";

SECRETKEY=".env"

# ---------------------

if [ ! -e "$ENVFILE" ]; then

    echo "$0 error: file: '$ENVFILE' doesn't exist"

    exit 1;
fi

set -e
set -x

TMPFILE="$_DIR/$SECRETKEY"

function cleanup {

    unlink "$TMPFILE" || true

    printf "\n\n\n build failed \n\n\n";
}

trap cleanup EXIT

cp "$ENVFILE" "$TMPFILE"

source "$TMPFILE"

if [ "$PROTECTED_KUB_CLUSTER" = "" ]; then

    echo "$0 error: environment variable missing 'PROTECTED_KUB_CLUSTER'";

    exit 1;
fi

/bin/bash "$_ROOT/bash/kuber/switch-cluster.sh" "$PROTECTED_KUB_CLUSTER"

if [ "$PROJECT_NAME_SHORT" = "" ]; then

    echo "$0 error: environment variable missing 'PROJECT_NAME_SHORT'";

    exit 1;
fi

SECRET="env-$PROJECT_NAME_SHORT";

/bin/bash "$_ROOT/bash/kuber/switch-cluster.sh" "$PROTECTED_KUB_CLUSTER"

SECRET="env-$PROJECT_NAME_SHORT";

# https://stackoverflow.com/a/45881259
kubectl create secret generic "$SECRET" --from-file="$TMPFILE" --dry-run -o yaml | kubectl apply -f -

kubectl get secrets

kubectl describe secret "$SECRET"

trap - EXIT

set +x

printf "\n    all good\n"

cat << EOF

try to run one of:

    kubectl get secrets

    kubectl describe secret "$SECRET"

EOF
