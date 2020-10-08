
npm-jest:
	/bin/bash docker.sh --tty -i --mode dev -- /bin/bash docker.sh dev-install

jest:
	@echo "\nrun:\n    /bin/bash test.sh --help\n"

wprod: yarndev
	/bin/bash webpack.sh

wdev:
	/bin/bash webpack.sh dev

preprocess:
	(cd webpack && node roderic/preprocessor.js)

# prod or dev
server:
	node server.js

dev:
	nodemon server.js

yarnprod:
	export NODE_ENV=production && yarn

yarndev:
	yarn