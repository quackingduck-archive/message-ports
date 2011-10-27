## Integration Tests

ms         = require './'
{testCase} = require 'nodeunit'


@["Basic Usage"] = testCase

  setUp: (proceed) ->
    ms.messageFormat = 'utf8'
    proceed()

  "basic client server communication (like HTTP)": (test) ->
    test.expect 2

    port = randomPort()

    reply = ms.reply port
    reply (msg, send) ->
      test.strictEqual msg, "status?"
      send "good!"

    request = ms.request port
    request "status?", (msg) ->
      test.strictEqual msg, "good!"

      request.close()
      reply.close()
      test.done()

  "basic unidirectional messaging (like unix pipes)": (test) ->
    test.expect 1

    port = randomPort()

    pull = ms.pull port
    pull (msg) ->
      test.strictEqual msg, 'hai'

      push.close()
      pull.close()
      test.done()

    push = ms.push port
    push 'hai'

  "basic broadcast messaging (like RSS)": (test) ->
    test.expect 1

    port = randomPort()

    subscribe = ms.subscribe port
    subscribe (msg) ->
      test.strictEqual msg, 'broadcast'

    publish = ms.publish port

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

    port = randomPort()

    ms.messageFormat = 'json'

    pull = ms.pull port
    pull (msg) ->
      test.deepEqual msg, { msg: 'hai', arr: [1,2,3] }

      push.close()
      pull.close()
      test.done()

    push = ms.push port
    push { msg: 'hai', arr: [1,2,3] }


  "msgpack": (test) ->
    test.expect 1

    port = randomPort()

    ms.messageFormat = 'msgpack'

    pull = ms.pull port
    pull (msg) ->
      test.deepEqual msg, { msg: 'hai', arr: [1,2,3] }

      push.close()
      pull.close()
      test.done()

    push = ms.push port
    push { msg: 'hai', arr: [1,2,3] }


@["req/rep"] = testCase

  setUp: (proceed) ->
    ms.messageFormat = 'utf8'
    proceed()

  "multiple requests": (test) ->
    test.expect 2

    port = randomPort()

    replyCount = 0

    reply = ms.reply port
    reply (msg, send) ->
      send "good! #{replyCount+=1}"

    request = ms.request port

    # request 1
    request "status?", (msg) ->
      test.strictEqual msg, "good! 1"

      request "status?", (msg) ->
        test.strictEqual msg, "good! 2"

        request.close()
        reply.close()
        test.done()

@["internals"] = testCase

  "zmqUrls": (test) ->
    test.expect 1
    test.deepEqual(
      ms._test.zmqUrls([2000,3000]),
      ["tcp://127.0.0.1:2000", "tcp://127.0.0.1:3000"]
    )
    test.done()


randomPort = -> Math.round(Math.random() * 10 + 2000)