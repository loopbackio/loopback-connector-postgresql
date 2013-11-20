## TESTS

TESTER = ./node_modules/.bin/mocha
OPTS = --timeout 10000 --require ./test/init.js
TESTS = test/*.test.js

test:
	$(TESTER) $(OPTS) $(TESTS)
test-verbose:
	$(TESTER) $(OPTS) --reporter spec $(TESTS)
testing:
	$(TESTER) $(OPTS) --watch $(TESTS)
.PHONY: test docs
