.PHONY: install lint lint-fix test

SHELL := /bin/bash
PATH := node_modules/.bin:$(PATH)
LINT_ARGS =
JEST_ARGS =

default:

install:
	docker-compose run --rm app npm i

lint:
	docker-compose run --rm app make _lint

lint-fix:
	docker-compose run --rm app make _lint LINT_ARGS="--fix"

test:
	docker-compose run --rm app make _test


# Private

_lint:
	eslint ${LINT_ARGS} "src/**/*.ts" "test/**/*.ts"

_start:
	node ./bin/server | bunyan -o short

_start-watch:
	nodemon ${NODEMON_EXTRA_ARGS} --watch src --watch bin --ext js,ts --delay 2 --exec 'make _start'

_test:
	jest --verbose --runInBand --detectOpenHandles
