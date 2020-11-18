
TRAPS=()

function trigger_traps {

  for i in "${TRAPS[@]}"
  do

      { yellow "\ntriggering trap: '$i'"; } 2>&3

      $i || true
  done
}

trap trigger_traps EXIT;

function final { { red "\n\ngeneral error...\n\n"; } 2>&3;}
TRAPS+=('final')

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

ROOT="$DIR/../../.."

source "$ROOT/bash/colours.sh";

if [ "$GIT_COMMIT" = "" ]; then

  { red "\n   GIT_COMMIT is empty\n"; } 2>&3

  exit 1;
fi

echo "raw  : 1                  >$1<"
echo "raw  : JENKINS__KUB_ENV   >$JENKINS__KUB_ENV<"
echo "raw  : SKIP_COMMIT_CHECK  >$SKIP_COMMIT_CHECK<"
echo "raw  : TAG_AT_LEAST       >$TAG_AT_LEAST<"
echo "raw  : RUN_TESTS          >$RUN_TESTS<"
echo "raw  : RUN_TESTS_DEFAULT_VALUE_IF_TRIGGERED_AUTOMATICALLY >$RUN_TESTS_DEFAULT_VALUE_IF_TRIGGERED_AUTOMATICALLY<"

if [ "$RUN_TESTS" = "" ];                                           then RUN_TESTS="false";         fi
if [ "$SKIP_COMMIT_CHECK" = "" ];                                   then SKIP_COMMIT_CHECK="false"; fi
if [ "$RUN_TESTS_DEFAULT_VALUE_IF_TRIGGERED_AUTOMATICALLY" = "" ];  then RUN_TESTS_DEFAULT_VALUE_IF_TRIGGERED_AUTOMATICALLY="false"; fi

TRIGGERED_MANUALLY="0"

if [ "$1" != "" ]; then

    TRIGGERED_MANUALLY="1"
fi

# set in jenkins parameter This project is parameterised
# name 'RUN_TESTS'
# with two values: notests, runtests   (notests - as first by default)
# https://i.imgur.com/xCbCMxO.png

TEST="^[0-9]+\.[0-9]+\.[0-9]+$"

if ! [[ $TAG_AT_LEAST =~ $TEST ]]; then

    { red "\n\nTAG_AT_LEAST don't match '$TEST' it is >$TAG_AT_LEAST<"; } 2>&3

    exit 1;
fi

_TFTEST="^(true|false)$"

if ! [[ $RUN_TESTS_DEFAULT_VALUE_IF_TRIGGERED_AUTOMATICALLY =~ $_TFTEST ]]; then

    { red "\n\nRUN_TESTS_DEFAULT_VALUE_IF_TRIGGERED_AUTOMATICALLY don't match '$_TFTEST' it is >$RUN_TESTS_DEFAULT_VALUE_IF_TRIGGERED_AUTOMATICALLY<"; } 2>&3

    exit 1;
fi




source ~/.bashrc
source ~/.bash_profile
set -x
set -e
pwd
id
/bin/bash gitstorage.sh pull --force
set +e
set +x






if [ "$TRIGGERED_MANUALLY" = "0" ]; then

    JENKINS__KUB_ENV=".env.kub.test"

    RUN_TESTS="$RUN_TESTS_DEFAULT_VALUE_IF_TRIGGERED_AUTOMATICALLY"
fi

echo "calc : TRIGGERED_MANUALLY >$TRIGGERED_MANUALLY<"
echo "calc : JENKINS__KUB_ENV   >$JENKINS__KUB_ENV<"
echo "calc : SKIP_COMMIT_CHECK  >$SKIP_COMMIT_CHECK<"
echo "calc : RUN_TESTS          >$RUN_TESTS<"

if ! [[ $RUN_TESTS =~ $_TFTEST ]]; then

    { red "\n\nRUN_TESTS not defined or not equal 'true' or 'false' - define it in jenkins"; } 2>&3

    exit 1;
fi

if ! [[ $SKIP_COMMIT_CHECK =~ $_TFTEST ]]; then

    { red "\n\nSKIP_COMMIT_CHECK not defined or not equal 'true' or 'false' - define it in jenkins"; } 2>&3

    exit 1;
fi

set -e

if [ "$SKIP_COMMIT_CHECK" = "false" ] && [ "$(/bin/bash "$ROOT/bash/jenkins/checksum-built-already.sh" "$GIT_COMMIT-$JENKINS__KUB_ENV")" = "found" ]; then

  { red "\n   GIT_COMMIT '$GIT_COMMIT' was already built for '$JENKINS__KUB_ENV' mode\n"; } 2>&3

  exit 209;
fi

set +e

echo "============================= vvv"
echo "============================= vvv"
env
ls -la
echo "============================= ^^^"
echo "============================= ^^^"

NODEMODULESFOLDERS=("node_modules" "migrations/node_modules");
for i in "${NODEMODULESFOLDERS[@]}"
do

  if [ -e "$i" ]; then

    { red "\n    $i directory should be removed because otherwise it will be added again to docker image layer\nunfortunately it might be removed only from root so do it manually"; } 2>&3

    exit 1;
  fi
done

set -e
set -o pipefail
set -x

echo "======================== bash_setup ===========================";

source ~/.bash_profile 1>> log.log 2>> /dev/null

cd "$ROOT";

#echo "====== mysql & node.js clock diff check =======";
#
#/bin/bash "$ROOT/console.sh" dbnodetimediff

echo "======================== preparing_environment ===========================";

# you might also consider using native command with --from-env-file=...
# example:
#         kubectl create secret generic my-secret --from-env-file=path/to/bar.env
# more:
#         kubectl create secret generic --help
# in roderic though it is better to create secret with file, because later we need to extract some
# environment variables from this file (except those prefixed with PROTECTED_) to env.json
# for frontend purposes
#
# JENKINS__KUB_ENV variable is coming from the jenkins job. Currently it can be set to either prod od stage

if [ "$JENKINS__KUB_ENV" = "" ]; then

    { red "$0 error:  JENKINS__KUB_ENV is empty; You can set this variable as a parameter in your jenkins job"; } 2>&3

    exit 1;
fi

if [ ! -f "$JENKINS__KUB_ENV" ]; then

    { red "$0 error: File '$JENKINS__KUB_ENV' doesn't exist"; } 2>&3

    exit 1;
fi;

cp "$ROOT/$JENKINS__KUB_ENV" "$ROOT/.env"

source "$ROOT/.env"

source "$ROOT/bash/time-format.sh"

if [ "$PROTECTED_DOCKER_REGISTRY" = "" ]; then

    { red "$0 error: environment variable missing 'PROTECTED_DOCKER_REGISTRY'"; } 2>&3

    exit 1;
fi

if [ "$PROTECTED_KUB_CLUSTER" = "" ]; then

    { red "$0 error: environment variable missing 'PROTECTED_KUB_CLUSTER'"; } 2>&3

    exit 1;
fi

if [ "$PROJECT_NAME_SHORT" = "" ]; then

    { red "$0 error: environment variable missing 'PROJECT_NAME_SHORT'"; } 2>&3

    exit 1;
fi

if [ "$PROJECT_NAME" = "" ]; then

    { red "$0 error: environment variable missing 'PROJECT_NAME'"; } 2>&3

    exit 1;
fi

#if [ "$PROJECT_NAME_PVC" = "" ]; then
#
#    { red "$0 error: environment variable missing 'PROJECT_NAME_PVC'"; } 2>&3
#
#    exit 1;
#fi

echo "======================== switching kubectl to target cluster ===========================";

/bin/bash "$ROOT/bash/kuber/switch-cluster.sh" "$PROTECTED_KUB_CLUSTER" 10

echo "======================== creating/updating production secret with .env ===========================";

/bin/bash "$ROOT/bash/kuber/create-secret-with-files-inside.sh" "env-$PROJECT_NAME_SHORT" "$ROOT/.env" .env

echo "======================== preparing_docker_build_files ===========================";

DOC="$ROOT/Dockerfile";
if [ -e "$DOC" ]; then

    { red "$0 error: file '$DOC' does already exist"; } 2>&3

    exit 1;
fi

IGN="$ROOT/.dockerignore";
if [ -e "$IGN" ]; then

    { red "$0 error: file '$IGN' does already exist"; } 2>&3

    exit 1;
fi

RUN="$ROOT/podrun.sh";
if [ -e "$RUN" ]; then

    { red "$0 error: file '$RUN' does already exist"; } 2>&3

    exit 1;
fi

DELETE=("$DOC" "$IGN" "$RUN");

function cleanup {

  echo "======================== first cleanup ===========================";

  set +x

  for i in "${DELETE[@]}"
  do

      { yellow "\nremoving '$i'"; } 2>&3

      unlink "$i" || true
  done
}

TRAPS=("cleanup" "${TRAPS[@]}")

echo "======================== checking existance of secrets and pvc's ===========================";

#CHECK=("secret env-${PROJECT_NAME_SHORT}" "pvc pvc-${PROJECT_NAME_PVC}");
CHECK=("secret env-${PROJECT_NAME_SHORT}");

for i in "${CHECK[@]}"
do
  { green "    checking existance of $i"; } 2>&3
  P1="$(echo $i | cut -d ' ' -f1)"
  P2="$(echo $i | cut -d ' ' -f2)"
  if [ "$(kubectl get $P1 | grep $P2 || true)" = "" ]; then
      { red "\n    $i doesn't exist\n"; } 2>&3
      exit 1;
  fi
done

echo "======================== copying_docker_build_files ===========================";

cp "$ROOT/docker/kbuild/.dockerignore" "$IGN"

cp "$ROOT/docker/kbuild/podrun.sh" "$RUN"

echo "======================== generating_docker_tag ===========================";

#GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

# cut off just "branch_name" from "origin/branch_name"
GIT_BRANCH="$(echo $GIT_BRANCH | sed -E "s/^[^u]+\/(.*)$/\1/")"

if [ "$GIT_BRANCH" = "HEAD" ]; then

    { red "$0 error: branch is HEAD, you are not in any particular branch"; } 2>&3

    exit 1;
fi

TAG="$(/bin/bash "$ROOT/bash/docker-registry/list-image-tags.sh" "$PROJECT_NAME" || true)"

TAG="$(echo "$TAG" | /bin/bash "$ROOT/bash/git/semver-filter-tags.sh" "0.0.0-$GIT_BRANCH" | tail -n 1)"

TAG="$TAG $(/bin/bash "$ROOT/bash/kuber/extract-tag-from-running-deployment.sh" "${PROJECT_NAME_SHORT}" || true)"

TAG="$(node "$ROOT/bash/kuber/determine-latest-tag.js" $TAG "${TAG_AT_LEAST}-$GIT_BRANCH")"

if [ "$TAG" = "" ]; then

    TAG="0.0.0-$GIT_BRANCH"
fi

TAG="$(/bin/bash "$ROOT/bash/semver.sh" "$TAG")"

printf "\nDEPLOYMENT_TAG=\"$TAG\"\n" >> "$ROOT/.env"

printf "\nBUILD_NUMBER=\"$BUILD_NUMBER\"\n" >> "$ROOT/.env"

printf "\nBUILD_TIME=\"$(date +"%Y-%m-%d %H:%M:%S")\"\n" >> "$ROOT/.env"

printf "\nGIT_COMMIT=\"$(echo $GIT_COMMIT | cut -c1-8)\"\n" >> "$ROOT/.env"

DOCTMP="$(/bin/bash "$ROOT/bash/envrender.sh" "$ROOT/.env" "$ROOT/docker/kbuild/Dockerfile" --clear --gen "jenkins-build-tmp")"

mv "$DOCTMP" "$DOC"

echo "======================== building_and_pushing_image ===========================";

# /bin/bash bash/jenkins/get-last-build-for-this-commit.sh --save --limit 6 --hash 5fd765f --tag lh:1.0.0-dedv
# /bin/bash bash/jenkins/get-last-build-for-this-commit.sh --save --limit 6 --hash 5fd765f --tag lh:1.0.0-dedv --limit 10
# /bin/bash bash/jenkins/get-last-build-for-this-commit.sh --find --hash 5fd765

TMP_TAG="$(/bin/bash "$ROOT/bash/jenkins/get-last-build-for-this-commit.sh" --find --hash "$GIT_COMMIT")"

function buildingtag {

set +x
echo ""
echo "PROJECT_NAME: >>$PROJECT_NAME<<"
echo "         TAG: >>$TAG<<"
echo ""
set -x

}

if [ "$TMP_TAG" = "" ]; then

    { green "\n    building tag '$TAG' for commit '$GIT_COMMIT'\n"; } 2>&3

    buildingtag

    docker build . -t "$PROJECT_NAME:$TAG"

    docker tag $PROJECT_NAME:$TAG $PROTECTED_DOCKER_REGISTRY/$PROJECT_NAME:$TAG

    docker push $PROTECTED_DOCKER_REGISTRY/$PROJECT_NAME:$TAG

    docker history --format "\t{{.Size}}\t\t{{.CreatedBy}}" "$PROJECT_NAME:$TAG" --no-trunc

    /bin/bash "$ROOT/bash/jenkins/get-last-build-for-this-commit.sh" --save --hash "$GIT_COMMIT" --tag "$TAG"
else

    TAG="$TMP_TAG";

    { green "\n    found tag '$TAG' from last build for commit '$GIT_COMMIT'\n"; } 2>&3

    buildingtag
fi

echo "======================== executing migrations ===========================";

(cd bash && yarn)

if [ "$JENKINS__KUB_ENV" = ".env.kub.test" ]; then

    if [ -f "$ROOT/.env.kub.prod" ]; then

        /bin/bash "$ROOT/bash/mysql/copytablesbetweendatabases.sh" .env.kub.prod .env.kub.test

    elif [ -f "$ROOT/.env.kub.stage" ]; then

        /bin/bash "$ROOT/bash/mysql/copytablesbetweendatabases.sh" .env.kub.stage .env.kub.test

    else

        { green "\n    Can't find .env.kub.prod nor .env.kub.stage to copy database to .env.kub.test\n"; } 2>&3
    fi
fi

LOCALENV="$ROOT/.env.migration"

cp "$ROOT/.env" "$LOCALENV"

DELETE+=("$LOCALENV")

DEPLOYMENT_FILE="$ROOT/docker/kbuild/deployment.yaml";

printf "\nDEPLOYMENT_TAG=\"$TAG\"\n" >> "$LOCALENV"

# OVERRIDE PROJECT_NAME
PROJECT_NAME_GENERATED="${PROJECT_NAME_SHORT}-migration"

printf "\nPROJECT_NAME_GENERATED=\"$PROJECT_NAME_GENERATED\"\n" >> "$LOCALENV"

DEPLOYMENT_FILE="$(/bin/bash "$ROOT/bash/envrender.sh" "$LOCALENV" "$DEPLOYMENT_FILE" --rmfirst --clear --gen "jenkins-build-tmp")"

node "$ROOT/bash/kuber/setold.js" "$DEPLOYMENT_FILE" _ spec.replicas 1 int

echo 'start'
cat "$DEPLOYMENT_FILE"
echo 'end'

kubectl apply -f "$DEPLOYMENT_FILE"

DEP="$(node "$ROOT/bash/kuber/getold.js" "$DEPLOYMENT_FILE" 0 metadata.name)"

kubectl rollout status "deployment.v1.apps/$DEP"

MIGRATION_DEPLOYMENT="${PROJECT_NAME_GENERATED}"

POD="$(/bin/bash "$ROOT/bash/kuber/get-name-of-n-pod-of-the-deployment.sh" "$MIGRATION_DEPLOYMENT")"

set +e
  CURRENTMIGRATIONS="$(kubectl exec -i "$POD" -- node migrations/CI/mcountdb.js)"
  EXITCODE="$?"
  if [ "$EXITCODE" != "0" ]; then
    echo "======================== node migrations/CI/mcountdb.js crashed - pod output =========================== vvv";
    kubectl logs "$POD"
    echo "======================== node migrations/CI/mcountdb.js crashed - pod output =========================== ^^^";
    exit $EXITCODE;
  fi
set -e

TEST="^[0-9]+$"
if ! [[ "$CURRENTMIGRATIONS" =~ $TEST ]]; then

    { red "$0 error: Current migration number doesn't match $TEST"; } 2>&3

    exit 1;
fi

function revertmigration {

    echo "======================== build failed - revertmigration ===========================";

    set -x

    set +e
      kubectl exec -i "$POD" -- /bin/bash migrations/CI/move.sh --nitro $CURRENTMIGRATIONS
      EXITCODE="$?"
      if [ "$EXITCODE" != "0" ]; then
        echo "======================== node migrations/CI/move.sh crashed - here is pod output =========================== vvv";
        kubectl logs "$POD"
        echo "======================== node migrations/CI/move.sh crashed - here is pod output =========================== ^^^";
        exit $EXITCODE;
      fi
    set -e

#    kubectl exec -i "$POD" -- /bin/bash -c "export MIGRATION_MODE=true && /bin/bash migrations/CI/move.sh --nitro $CURRENTMIGRATIONS"

    kubectl delete deploy "$MIGRATION_DEPLOYMENT"

    kubectl delete svc "$MIGRATION_DEPLOYMENT-service"
}

TRAPS=("revertmigration" "${TRAPS[@]}")

set +e
  kubectl exec -i "$POD" -- /bin/bash migrations/CI/mrun.sh --nitro
  EXITCODE="$?"
  if [ "$EXITCODE" != "0" ]; then
    echo "======================== node migrations/CI/mrun.sh crashed - here is pod output =========================== vvv";
    kubectl logs "$POD"
    echo "======================== node migrations/CI/mrun.sh crashed - here is pod output =========================== ^^^";
    exit $EXITCODE;
  fi
set -e

kubectl delete deploy "$MIGRATION_DEPLOYMENT"

kubectl delete svc "$MIGRATION_DEPLOYMENT-service"

function revertmigration {

    echo "overridden revertmigration"
}

echo "======================== test: solving hook condition to run tests or not =========================== vvv";

if [ "$RUN_TESTS" = "true" ]; then

    echo -e "\n\ntriggering tests\n\n"

    (cd puppeteer/kubernetes && yarn)

    BASIC_AUTH_PARAM=""
    if [ "$PROTECTED_KUB_BASIC_SECRET" != "" ]; then
        BASIC_AUTH_PARAM="--basic-auth-secret $PROTECTED_KUB_BASIC_SECRET"
    fi

    (cd puppeteer/kubernetes && /bin/bash run.sh .env --deployment-yaml "$ROOT/docker/kbuild/deployment.yaml" --deployment-tag "$TAG" $BASIC_AUTH_PARAM)
else
    echo -e "\n\nnot triggering tests\n\n"
fi

echo "======================== test: solving hook condition to run tests or not =========================== ^^^";


echo "======================== kubernetes_deploy ===========================";

DEPLOYMENT_FILE="$ROOT/docker/kbuild/deployment.yaml";

printf "\nDEPLOYMENT_TAG=\"$TAG\"\n" >> "$ROOT/.env"

PROJECT_NAME_GENERATED="${PROJECT_NAME_SHORT}"

printf "\nPROJECT_NAME_GENERATED=\"$PROJECT_NAME_GENERATED\"\n" >> "$ROOT/.env"

DEPLOYMENT_FILE="$(/bin/bash "$ROOT/bash/envrender.sh" "$ROOT/.env" "$DEPLOYMENT_FILE" --rmfirst --clear --gen "jenkins-build-tmp")"

if [ "$JENKINS__KUB_ENV" = ".env.kub.test" ]; then

    node "$ROOT/bash/kuber/setold.js" "$DEPLOYMENT_FILE" _ spec.replicas 1 int
fi

# kubectl --record deployment.apps/nginx-deployment set image deployment.v1.apps/nginx-deployment nginx=nginx:1.9.1
# or: kubectl set image deployment/nginx-deployment nginx=nginx:1.9.1 --record
# from: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment
# kubectl rollout status deployment.v1.apps/nginx-deployment
kubectl apply -f "$DEPLOYMENT_FILE"

DEP="$(node "$ROOT/bash/kuber/getold.js" "$DEPLOYMENT_FILE" 0 metadata.name)"

kubectl rollout status "deployment.v1.apps/$DEP"

{ green "\n    visit:\n        https://$PROTECTED_DOCKER_REGISTRY/v2/_catalog"; } 2>&3
{ green "        https://$PROTECTED_DOCKER_REGISTRY/v2/$PROJECT_NAME/tags/list\n\n"; } 2>&3

function final { { green "\n\nall good...\n\n"; } 2>&3;}






