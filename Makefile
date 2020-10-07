
npm-jest:
	/bin/bash docker.sh --tty -i --mode dev -- /bin/bash docker.sh dev-install

jest:
	@echo "\nrun:\n    /bin/bash test.sh --help\n"

wpck-build:
	/bin/bash webpack.sh

wpck-dev:
	/bin/bash webpack.sh dev

preprocess:
	(cd webpack && node roderic/preprocessor.js)

# prod or dev
server:
	node server.js