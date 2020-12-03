docker run -it -v "$(pwd):/var/opt" python:3.7.6-slim bash

cd /var/opt
/bin/bash upload.sh --source deploy.sh --targetdir ____target

