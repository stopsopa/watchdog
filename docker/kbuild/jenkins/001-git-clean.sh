
set -e
set -x

git checkout .
git clean -df
git status
ls -la

pwd

if [ -e "$ROOT/.jenkins" ]; then

    unlink "$ROOT/.jenkins";
fi