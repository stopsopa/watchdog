
set -e
set -x

_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

_ROOT="$_DIR"

source "$_ROOT/bash/colours.sh"

source .env

make wprod

/bin/bash "$_ROOT/bash/kuber/switch-cluster.sh" "$PROTECTED_KUB_CLUSTER"



set +x
echo ""
echo "PROJECT_NAME: >>$PROJECT_NAME_DOCKER_IMAGE<<"
echo "         TAG: >>$TAG<<"
echo ""
set -x

docker build . -t "$PROJECT_NAME_DOCKER_IMAGE:$TAG"

docker tag $PROJECT_NAME_DOCKER_IMAGE:$TAG $PROTECTED_DOCKER_REGISTRY/$PROJECT_NAME_DOCKER_IMAGE:$TAG

docker push $PROTECTED_DOCKER_REGISTRY/$PROJECT_NAME_DOCKER_IMAGE:$TAG

docker history --format "\t{{.Size}}\t\t{{.CreatedBy}}" "$PROJECT_NAME_DOCKER_IMAGE:$TAG" --no-trunc



set +x

echo ""
echo ""
{ green "\n    visit:\n        https://$PROTECTED_DOCKER_REGISTRY/v2/_catalog"; } 2>&3
{ green "        https://$PROTECTED_DOCKER_REGISTRY/v2/$PROJECT_NAME_DOCKER_IMAGE/tags/list\n\n"; } 2>&3
echo ""
echo ""

set -x

DEPLOYMENT_FILE="$_ROOT/deployment.yaml";

DEPLOYMENT_FILE="$(/bin/bash "$_ROOT/bash/envrender.sh" "$_ROOT/.env" "$DEPLOYMENT_FILE" --rmfirst --clear --gen "test-build-tmp")"

kubectl apply -f "$DEPLOYMENT_FILE"

set +x

echo -e "\n\n    all good\n\n"
