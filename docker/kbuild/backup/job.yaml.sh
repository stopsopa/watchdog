
_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

_ROOT="$_DIR/../../..";

source "$_ROOT/bash/colours.sh"

GITPULLDIR="$_DIR/gitpull"

if [ "$1" = "" ]; then

  (cd "$_ROOT" && find . -type f -maxdepth 1 | grep ".env.kub.")

  exit 1;
fi

ENVFILE="$_ROOT/$1";

if [ ! -f "$ENVFILE" ]; then

    echo "$0 error: file: '$ENVFILE' doesn't exist"

    exit 1;
fi

SCRIPT="$_DIR/$2";

if [ ! -f "$SCRIPT" ]; then

    echo "$0 error: file: '$SCRIPT' doesn't exist"

    exit 1;
fi

set -e
set -x

source "$ENVFILE"

source "$_DIR/.env"

if [ "$GITREPO" = "" ]; then

    echo "$0 error: environment variable missing 'GITREPO'";

    exit 1;
fi

if [ "$PROJECT_NAME" = "" ]; then

    echo "$0 error: environment variable missing 'PROJECT_NAME'";

    exit 1;
fi

if [ "$TAG" = "" ]; then

    echo "$0 error: environment variable missing 'TAG'";

    exit 1;
fi

#if [ "$PROJECT_NAME_PVC" = "" ]; then
#
#    echo "$0 error: environment variable missing 'PROJECT_NAME_PVC'";
#
#    exit 1;
#fi

if [ "$PROTECTED_DOCKER_REGISTRY" = "" ]; then

    echo "$0 error: environment variable missing 'PROTECTED_DOCKER_REGISTRY'";

    exit 1;
fi

if [ "$PROJECT_NAME_SHORT" = "" ]; then

    echo "$0 error: environment variable missing 'PROJECT_NAME_SHORT'";

    exit 1;
fi

if [ "$PROTECTED_KUB_CLUSTER" = "" ]; then

    echo "$0 error: environment variable missing 'PROTECTED_KUB_CLUSTER'";

    exit 1;
fi

if ! [ -d "$GITPULLDIR" ]; then

  mkdir -p "$GITPULLDIR"
fi

cd "$GITPULLDIR"

if [ -f "entry.py" ]; then

  git checkout .

  git clean -df

  git pull

else

  git clone "$GITREPO" .
fi

cd ..

echo ""
cp -v "$_DIR/Dockerfile"     "$GITPULLDIR/"
echo ""
(cd "$_DIR" && cp -v *.sh    "$GITPULLDIR/")
echo ""
cp -v "$_DIR/.dockerignore"  "$GITPULLDIR/"
echo ""

(cd "$GITPULLDIR" && docker build . -t "$PROJECT_NAME:$TAG")

docker tag $PROJECT_NAME:$TAG $PROTECTED_DOCKER_REGISTRY/$PROJECT_NAME:$TAG

docker push $PROTECTED_DOCKER_REGISTRY/$PROJECT_NAME:$TAG

{ green "\n    visit:\n        https://$PROTECTED_DOCKER_REGISTRY/v2/_catalog"; } 2>&3
{ green "        https://$PROTECTED_DOCKER_REGISTRY/v2/$PROJECT_NAME/tags/list\n\n"; } 2>&3

/bin/bash "$_ROOT/bash/kuber/switch-cluster.sh" "$PROTECTED_KUB_CLUSTER"

cd "$_DIR";

TMPFILE="$(/bin/bash "$_ROOT/bash/cptmp.sh" "$ENVFILE" -c -g "cron-tmp")"

cp "$ENVFILE" "$TMPFILE"

PB="$(basename "$SCRIPT")"
FILENAME="${PB%.*}"
if [ "$FILENAME" = "" ]; then
  FILENAME="$PB"
fi

FILENAME="$(echo "$FILENAME" | sed -E 's:[^a-z0-9A-Z]+::g')"

if [ "$FILENAME" = "" ]; then

  echo "$0 error: FILENAME is empty"

  exit 1
fi

CRONTIMEVARIABLE="$(/bin/bash "$SCRIPT" --getenvparam)";

TEST="^[a-zA-Z_0-9]+$"

if ! [[ $CRONTIMEVARIABLE =~ $TEST ]]; then

    echo -e "Script '/bin/bash \"$SCRIPT\" --getenvparam' should return variable name that match '${TEST}' but it has returned '$CRONTIMEVARIABLE'";

    exit 1;
fi

set

CMD="echo \"\$$CRONTIMEVARIABLE\""

CRONTIME="$(eval $CMD)"

if [ "$CRONTIME" = "" ]; then

  echo "$0 error: CRONTIME is empty"

  exit 1
fi

RAND="$(openssl rand -hex 2)"

printf "\nRAND=\"$RAND\"\n" >> "$TMPFILE"

printf "\nFILENAME=\"$FILENAME\"\n" >> "$TMPFILE"

printf "\nPROTECTED_KUB_CRONJOB_TIME=\"$CRONTIME\"\n" >> "$TMPFILE"

PROJECT_NAME_SHORT_GENERATED="$PROJECT_NAME_SHORT"

printf "\nPROJECT_NAME_SHORT_GENERATED=\"$PROJECT_NAME_SHORT_GENERATED\"\n" >> "$TMPFILE"

echo "" >> "$TMPFILE"

cat "$_DIR/.env" >> "$TMPFILE"

DOCTMP="$(/bin/bash "$_ROOT/bash/envrender.sh" "$TMPFILE" "$_DIR/job.yaml" --clear --rmfirst -g "job-tmp")"

node "$_ROOT/bash/kuber/setyaml.js" "$DOCTMP" --block _ --key spec.template.spec.containers.0.command --json "[\"/bin/bash\", \"/home/node/app/$2\"]"

JOB_NAME="${PROJECT_NAME_SHORT_GENERATED}-${FILENAME}-testjob"

function cleanup {

    if [ "$1" != "" ]; then

        { green "\n\ncleanup...\n\n"; } 2>&3
    fi

    kubectl delete job "$JOB_NAME" || true

    if [ "$1" != "" ]; then

      sleep 3
    fi
}

cleanup first

trap cleanup EXIT

kubectl apply -f "$DOCTMP";

LIST=""

POD=""

set +x

while true
do

    echo "attempt to extract list of pods of the job '$JOB_NAME'"

    LIST="$(/bin/bash "$_ROOT/bash/kuber/get-name-of-n-pod-of-the-deployment.sh" "$JOB_NAME")"

    if [ "$LIST" = "" ]; then

        sleep 1;
    else

      POD="$(echo "$LIST" | head -n 1)"

      break;
    fi
done

echo -e "\n\nFOUND POD '$POD'\n\n"

sleep 1

while true
do

    echo "attempt to attach to stdout of pod '$POD' last status: '$STATUS'"

    STATUS="$(kubectl get pod "$POD" -o jsonpath="{.status.phase}")"

    if [ "$STATUS" = "Running" ] || [ "$STATUS" = "Succeeded" ] || [ "$STATUS" = "Failed" ]; then

      break;
    fi

    sleep 2
done

echo -e "\nattaching:\n==================="

kubectl logs --follow "$POD"


#JOB_NAME_QUOTED="$(/bin/bash "$_ROOT/bash/preg_quote.sh" "$JOB_NAME")"
#
#POD="$(kubectl get pod -o name | sed -nE "/^pod\/$JOB_NAME_QUOTED-[a-z0-9-]+$/p" | sed -En "s/^pod\/($JOB_NAME_QUOTED-[a-z0-9-]+)$/\1/p" | tail -n 1)"
#
#echo "POD=$POD"
##CMD="$@"
##
##if [ "$CMD" = "" ]; then
##
##  CMD="bash"
##fi
##
##echo "========== stdout ========"
##
##kubectl exec -it "$POD" -- $CMD
##
##echo "======== stdout end ========"
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#
#watch kubectl get pod



