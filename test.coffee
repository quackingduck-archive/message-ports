## Integration Tests

plug       = require './'
{testCase} = require 'nodeunit'


@["Basic Usage"] = testCase

  setUp: (proceed) ->
    plug.messageFormat = 'utf8'
    proceed()

  "basic client server communication (like HTTP)": (test) ->
    test.expect 2

    plugPath = 'ipc:///tmp/test.plug'

    reply = plug.reply plugPath
    reply (msg, send) ->
      test.strictEqual msg, "status?"
      send "good!"

    request = plug.request plugPath
    request "status?", (msg) ->
      test.strictEqual msg, "good!"

      request.close()
      reply.close()
      test.done()

  "basic unidirectional messaging (like unix pipes)": (test) ->
    test.expect 1

    plugPath = 'ipc:///tmp/test.plug'

    pull = plug.pull plugPath
    pull (msg) ->
      test.strictEqual msg, 'hai'

      push.close()
      pull.close()
      test.done()

    push = plug.push plugPath
    push 'hai'

  "basic broadcast messaging (like RSS)": (test) ->
    test.expect 1

    plugPath = 'ipc:///tmp/test.plug'

    subscribe = plug.subscribe plugPath
    subscribe (msg) ->
      test.strictEqual msg, 'broadcast'

    publish = plug.publish plugPath

    # Though the `subscribe` call returns straight away it actually takes a
    # while for a subscriber to connect to a publisher so we wait a little bit
    # to ensure it's connected
    setTimeout ->
      publish 'broadcast'
    , 200

    # End the test regardless of if the subscriber managed to connect
    setTimeout ->
      publish.close()
      subscribe.close()
      test.done()
    , 210


@["Message formatting"] = testCase

  "JSON": (test) ->
    test.expect 1

    plugPath = 'ipc:///tmp/test-json.plug'

    plug.messageFormat = 'json'

    pull = plug.pull plugPath
    pull (msg) ->
      test.deepEqual msg, { msg: 'hai', arr: [1,2,3] }

      push.close()
      pull.close()
      test.done()

    push = plug.push plugPath
    push { msg: 'hai', arr: [1,2,3] }


  "msgpack": (test) ->
    test.expect 1

    plugPath = 'ipc:///tmp/test-json.plug'

    plug.messageFormat = 'msgpack'

    pull = plug.pull plugPath
    pull (msg) ->
      test.deepEqual msg, { msg: 'hai', arr: [1,2,3] }

      push.close()
      pull.close()
      test.done()

    push = plug.push plugPath
    push { msg: 'hai', arr: [1,2,3] }
