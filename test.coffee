## Integration Tests

plug       = require './'
{testCase} = require 'nodeunit'

plug.messageFormat 'utf8'

module.exports = testCase

  "basic client server communication": (test) ->
    test.expect 2

    plugPath = 'ipc:///tmp/test.plug'

    reply = plug.reply plugPath
    reply (msg, send) ->
      test.equals msg, "status?"
      send "good!"

    request = plug.request plugPath
    request "status?", (msg) ->
      test.equals msg, "good!"
      test.done()

  "basic unidirectional messaging": (test) ->
    test.expect 1

    plugPath = 'ipc:///tmp/test.plug'

    pull = plug.pull plugPath
    pull (msg) ->
      test.equal msg, 'hai'
      test.done()

    push = plug.push plugPath
    push 'hai'

  "basic broadcast messaging": (test) ->
    test.expect 1

    plugPath = 'ipc:///tmp/test.plug'

    subscribe = plug.subscribe plugPath
    subscribe (msg) ->
      test.equal msg, 'broadcast'
      test.done()

    publish = plug.publish plugPath

    # Though the `subscribe` call returns straight away it actually takes a
    # while for a subscriber to connect to a publisher so we wait a little bit
    # to ensure it's connected
    setTimeout ->
      publish 'broadcast'
    , 300
