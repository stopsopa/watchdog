
cd /home/node/app

cp .env.dist .env

(
  cd public
  if [ -e public ]; then echo 'dist symlink already exist'; else ln -s ../node_modules public; fi
)

source .env

(cd app && node lib/preprocessor.js)

node server.js
