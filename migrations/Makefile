h: # just list all available commands
	@printf "\nhttps://github.com/typeorm/typeorm/tree/master/docs\n\n"
	@printf "node node_modules/.bin/ts-node node_modules/.bin/typeorm\n\n"

# too see what are the differences between schema and real db
#(this command is not changing anything in db - just read and compare - ALWAYS SAFE)
dumpsql:
	@node node_modules/.bin/ts-node node_modules/.bin/typeorm schema:log

diff: # to generate new migration with diff sql based on manual changes of schema
	@node node_modules/.bin/ts-node node_modules/.bin/typeorm migration:generate --name auto

migrate: # execute all pending migrations
	@node node_modules/.bin/ts-node node_modules/.bin/typeorm migration:run

create:
	@printf "\n    node node_modules/.bin/ts-node node_modules/.bin/typeorm migration:create -n [name]\n\n";

sync: # doctrine:schema:update --force - BE CAREFUL IT MIGHT BREAK DATA IN FOREIGN KEY COLLUMNS
	@printf "This is dangerous command so run it yourself manually"
	@printf "\n    node node_modules/.bin/ts-node node_modules/.bin/typeorm schema:sync\n\n";

drop: # removes all tables with data from db - BE CAREFUL IT MIGHT BE DANGEROUS
	@printf "This is dangerous command so run it yourself manually"
	@printf "\n    node node_modules/.bin/ts-node node_modules/.bin/typeorm schema:drop\n\n";

# for CI  vvv
mcountdb:
	@(cd CI && /bin/bash link.sh)
	@(cd CI && node mcountdb.js)
torun: # how many migrations with next mrun will be executed
	@(cd CI && /bin/bash torun.sh)
mrun: # Execute all prepared (NEW) migrations
	@(cd CI && /bin/bash mrun.sh);
nitrorun: # much faster version of mrun (after optimisation)
	@(cd CI && /bin/bash mrun.sh --nitro);
mmove:
	@printf "\n(cd CI && /bin/bash move.sh [int])\n\n";
nitromove:
	@printf "\n(cd CI && /bin/bash move.sh --nitro [int])\n\n";
mrevert: # Reverts ONE migration back
	@(cd CI && /bin/bash link.sh)
	@(cd CI && node info.js)
	@node node_modules/.bin/ts-node node_modules/.bin/typeorm migration:revert
fixtures:
	@(cd CI && /bin/bash link.sh)
	node recreate-db.js
	make -s mrun
minfo: # Script to determine how many migrations were executed until now (from DB)
	@(cd CI && /bin/bash link.sh)
	@(cd CI && node info.js)
mtest: mrun
	@(cd CI && /bin/bash mtest.sh)

# for CI  ^^^

linknpm:
	[ ! -e node_modules ] && ln -s ../node_modules/ . || true
