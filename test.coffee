## Integration Tests

ms         = require './'
{testCase} = require 'nodeunit'


@["Basic Usage"] = testCase

  setUp: (proceed) ->
    ms.messageFormat = 'utf8'
    proceed()

  "basic client server communication (like HTTP)": (test) ->
    test.expect 2

    msPath = 'ipc:///tmp/test.ms'

    reply = ms.reply msPath
    reply (msg, send) ->
      test.strictEqual msg, "status?"
      send "good!"

    request = ms.request msPath
    request "status?", (msg) ->
      test.strictEqual msg, "good!"

      request.close()
      reply.close()
      test.done()

  "basic unidirectional messaging (like unix pipes)": (test) ->
    test.expect 1

    msPath = 'ipc:///tmp/test.ms'

    pull = ms.pull msPath
    pull (msg) ->
      test.strictEqual msg, 'hai'

      push.close()
      pull.close()
      test.done()

    push = ms.push msPath
    push 'hai'

  "basic broadcast messaging (like RSS)": (test) ->
    test.expect 1

    msPath = 'ipc:///tmp/test.ms'

    subscribe = ms.subscribe msPath
    subscribe (msg) ->
      test.strictEqual msg, 'broadcast'

    publish = ms.publish msPath

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

    msPath = 'ipc:///tmp/test-json.ms'

    ms.messageFormat = 'json'

    pull = ms.pull msPath
    pull (msg) ->
      test.deepEqual msg, { msg: 'hai', arr: [1,2,3] }

      push.close()
      pull.close()
      test.done()

    push = ms.push msPath
    push { msg: 'hai', arr: [1,2,3] }


  "msgpack": (test) ->
    test.expect 1

    msPath = 'ipc:///tmp/test-json.ms'

    ms.messageFormat = 'msgpack'

    pull = ms.pull msPath
    pull (msg) ->
      test.deepEqual msg, { msg: 'hai', arr: [1,2,3] }

      push.close()
      pull.close()
      test.done()

    push = ms.push msPath
    push { msg: 'hai', arr: [1,2,3] }
