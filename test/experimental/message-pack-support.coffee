mp         = require '../../src/message-ports'
{testCase} = require 'nodeunit'

@["Message formatting"] = testCase

  "msgpack": (test) ->
    test.expect 1

    port = randomPort()

    mp.messageFormat = 'msgpack'

    pull = mp.pull port
    pull (msg) ->
      test.deepEqual msg, { msg: 'hai', arr: [1,2,3] }

      push.close()
      pull.close()
      test.done()

    push = mp.push port
    push { msg: 'hai', arr: [1,2,3] }