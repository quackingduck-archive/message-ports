assert = require 'assert'
int = require('../src/message-ports')._test

suite "Internals"

test 'zmqUrl converts port to tcp url', ->
  assert.equal int.zmqUrl(3000), 'tcp://127.0.0.1:3000'

test 'zmqUrl converts path to ipc url', ->
  assert.equal int.zmqUrl('/tmp/foo-pull'), 'ipc:///tmp/foo-pull'

test 'zmqUrl leaves urls alone', ->
  assert.equal 'ipc:///tmp/foo-pull', 'ipc:///tmp/foo-pull'
  assert.equal 'tcp://127.0.0.1:3000', 'tcp://127.0.0.1:3000'

test 'zmqUrls converts multiple urls', ->
  assert.deepEqual(
    int.zmqUrls([3000, '/tmp/foo-pull'])
    ['tcp://127.0.0.1:3000', 'ipc:///tmp/foo-pull']
  )
