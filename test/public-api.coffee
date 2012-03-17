## Integration Tests

mp         = require '../src/message-ports'
{testCase} = require 'nodeunit'


@["Basic Usage"] = testCase

  setUp: (proceed) ->
    mp.messageFormat = 'utf8'
    proceed()

  "basic client server communication (like HTTP)": (test) ->
    test.expect 2

    port = randomPort()

    reply = mp.reply port
    reply (msg, send) ->
      test.strictEqual msg, "status?"
      send "good!"

    request = mp.request port
    request "status?", (msg) ->
      test.strictEqual msg, "good!"

      request.close()
      reply.close()
      test.done()

  "basic unidirectional messaging (like unix pipes)": (test) ->
    test.expect 1

    port = randomPort()

    pull = mp.pull port
    pull (msg) ->
      test.strictEqual msg, 'hai'

      push.close()
      pull.close()
      test.done()

    push = mp.push port
    push 'hai'

  "basic broadcast messaging (like RSS)": (test) ->
    test.expect 1

    port = randomPort()

    subscribe = mp.subscribe port
    subscribe (msg) ->
      test.strictEqual msg, 'broadcast'

    publish = mp.publish port

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

    mp.messageFormat = 'json'

    pull = mp.pull port
    pull (msg) ->
      test.deepEqual msg, { msg: 'hai', arr: [1,2,3] }

      push.close()
      pull.close()
      test.done()

    push = mp.push port
    push { msg: 'hai', arr: [1,2,3] }


@["req/rep"] = testCase

  setUp: (proceed) ->
    mp.messageFormat = 'utf8'
    proceed()

  "multiple requests": (test) ->
    test.expect 2

    port = randomPort()

    replyCount = 0

    reply = mp.reply port
    reply (msg, send) ->
      send "good! #{replyCount+=1}"

    request = mp.request port

    # request 1
    request "status?", (msg) ->
      test.strictEqual msg, "good! 1"

      request "status?", (msg) ->
        test.strictEqual msg, "good! 2"

        request.close()
        reply.close()
        test.done()

randomPort = -> Math.round(Math.random() * 10 + 2000)
