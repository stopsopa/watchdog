
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

ROOT="$DIR/../../.."

set -e
set -x

ENV="$ROOT/.env"

source "$ROOT/bash/colours.sh"

source "$ENV"

source "$DIR/.env"

if [ "$TAG" = "" ]; then

    echo "$0 error: environment variable missing 'TAG'";

    exit 1;
fi

if [ "$PROJECT_NAME" = "" ]; then

    echo "$0 error: environment variable missing 'PROJECT_NAME'";

    exit 1;
fi

if [ "$PROJECT_NAME_SHORT" = "" ]; then

    echo "$0 error: environment variable missing 'PROJECT_NAME_SHORT'";

    exit 1;
fi

if [ "$PROJECT_NAME_DOCKER_IMAGE" = "" ]; then

    echo "$0 error: environment variable missing 'PROJECT_NAME_DOCKER_IMAGE'";

    exit 1;
fi

if [ "$PROTECTED_KUB_CLUSTER" = "" ]; then

    echo "$0 error: environment variable missing 'PROTECTED_KUB_CLUSTER'";

    exit 1;
fi

if [ "$PROTECTED_DOCKER_REGISTRY" = "" ]; then

    { red "\n    PROTECTED_DOCKER_REGISTRY environment variable is empty or doesn't exist\n"; } 2>&3

    exit 1;
fi

if [ "$PROJECT_NAME_SHORT" = "" ]; then

    echo "$0 error: environment variable missing 'PROJECT_NAME_SHORT'";

    exit 1;
fi

if [ "$PROJECT_NAME_PVC" = "" ]; then

    echo "$0 error: environment variable missing 'PROJECT_NAME_PVC'";

    exit 1;
fi

if [ "$PROJECT_NAME_SHORT_PVC__NODASH" = "" ]; then

    echo "$0 error: environment variable missing 'PROJECT_NAME_SHORT_PVC__NODASH'";

    exit 1;
fi

/bin/bash "$ROOT/bash/kuber/switch-cluster.sh" "$PROTECTED_KUB_CLUSTER"

docker build . -t "$PROJECT_NAME_DOCKER_IMAGE:$TAG"

# docker run -it $PROJECT_NAME_DOCKER_IMAGE:$TAG bash

docker tag $PROJECT_NAME_DOCKER_IMAGE:$TAG $PROTECTED_DOCKER_REGISTRY/$PROJECT_NAME_DOCKER_IMAGE:$TAG

docker push $PROTECTED_DOCKER_REGISTRY/$PROJECT_NAME_DOCKER_IMAGE:$TAG

{ green "\n    visit:\n        https://$PROTECTED_DOCKER_REGISTRY/v2/_catalog"; } 2>&3
{ green "        https://$PROTECTED_DOCKER_REGISTRY/v2/$PROJECT_NAME_DOCKER_IMAGE/tags/list\n\n"; } 2>&3

ENVTMP="$DIR/.env.tmp";

cp "$ENV" "$ENVTMP"

DELETE=("$ENVTMP");

function cleanup {

  for i in "${DELETE[@]}"
  do
#      { yellow "\nremoving '$i'"; } 2>&3

      unlink "$i" || true
  done

  kubectl delete -f "$DEPLOYMENT_FILE"
}

trap cleanup EXIT;

RAND="$(openssl rand -hex 2)"

printf "\nDEPLOYMENT_TAG=\"$TAG\"\n" >> "$ENVTMP"

printf "\nRAND=\"$RAND\"\n" >> "$ENVTMP"

DEPLOYMENT_FILE="$DIR/pod.yaml";

DEPLOYMENT_FILE="$(/bin/bash "$ROOT/bash/envrender.sh" "$ENVTMP" "$DEPLOYMENT_FILE" --clear --rmfirst -g "ubuntu-tmp")"

CHECK=("secret k8s-ssh-key" "secret env-${PROJECT_NAME_SHORT}" "pvc pvc-${PROJECT_NAME_PVC}");

for i in "${CHECK[@]}"
do
  { green "    checking existance of $i"; } 2>&3
  P1="$(echo $i | cut -d ' ' -f1)"
  P2="$(echo $i | cut -d ' ' -f2)"
  kubectl get $P1 $P2
  if [ "$?" != "0" ]; then
      { red "\n    $i doesn't exist\n"; } 2>&3
      exit 1;
  fi
done

kubectl apply -f "$DEPLOYMENT_FILE"

DEPLOYMENT_NAME="${PROJECT_NAME}-$PROJECT_NAME_DOCKER_IMAGE-$RAND"

DEPLOYMENT_NAME_QUOTED="$(/bin/bash "$ROOT/bash/preg_quote.sh" "$DEPLOYMENT_NAME")"

kubectl rollout status "deployment.v1.apps/$DEPLOYMENT_NAME"

POD="$(kubectl get pod -o name | sed -nE "/^pod\/$DEPLOYMENT_NAME_QUOTED-[a-z0-9-]+$/p" | sed -En "s/^pod\/($DEPLOYMENT_NAME_QUOTED-[a-z0-9-]+)$/\1/p" | tail -n 1)"

CMD="$@"

if [ "$CMD" = "" ]; then

  CMD="bash"
fi

echo "========== stdout ========"

kubectl exec -it "$POD" -- $CMD

echo "======== stdout end ========"










