# build all lib files
lib :
	./node_modules/.bin/coffee --compile --lint --output lib src

# run non-experimental tests
test :
	./node_modules/.bin/nodeunit test

# build single lib file
lib/%.js : src/%.coffee
	./node_modules/.bin/coffee --compile --lint --output lib $<

.PHONY: test lib
