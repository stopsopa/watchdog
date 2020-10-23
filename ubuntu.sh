set -x
set -e
(cd docker/kbuild/ubuntu && /bin/bash build.sh $@)