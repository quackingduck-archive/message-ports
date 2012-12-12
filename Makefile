all : lib

# ---

test : test-api test-internals

test-api :
	./node_modules/.bin/nodeunit test/public-api.coffee

test-internals :
	./node_modules/.bin/mocha --ui qunit --reporter spec --bail --colors

test-experimental :
	./node_modules/.bin/nodeunit test/experimental

# ---

# build all lib files
lib :
	./node_modules/.bin/coffee --compile --lint --output lib src

# build single lib file
lib/%.js : src/%.coffee
	./node_modules/.bin/coffee --compile --lint --output lib $<

# ---

tag:
	git tag v`coffee -e "console.log JSON.parse(require('fs').readFileSync 'package.json').version"`

.PHONY: test lib tag
