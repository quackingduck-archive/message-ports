mp = require './'

# entry point
run = (args) ->
  type = args.shift()
  type = typeAliases[type] if typeAliases[type]?
  validateType type
  port = args.shift()
  validatePort port
  port = parseInt port
  if args.length is 0
    interactiveMode type, port
  else
    # todo: fancy command mode
    printUsageAndExitWithError()

# ## Interactive modes
#
# One per socket type. These modes allow the user to interact with the
# different socket types from the commandline

interactiveMode = (type, port) ->
  process.stdin.setEncoding 'utf8'
  input = require('readline').createInterface process.stdin, process.stdout
  input.setPrompt '< '

  mp.messageFormat = 'utf8'
  messagePort = mp[type](port)

  input.on 'close', ->
    process.stdout.write '\n'
    process.stdin.destroy()
    messagePort.close()

  getLine = (callback) ->
    input.once 'line', callback
    input.prompt()

  interactiveMode[type](port, messagePort, getLine)

# this namespace is too long
im = interactiveMode

im.rep = (portNumber, messagePort, getLine) ->
  reply = messagePort
  im.info "started reply socket on port #{portNumber}"
  im.info "waiting for request"
  reply (requestMsg, send) ->
    im.info "request received:"
    im.received requestMsg
    getLine (line) ->
      send line
      im.info "reply sent"
      im.info "waiting for request"

im.req = (portNumber, messagePort, getLine) ->
  request = messagePort
  im.info "started request socket on port #{portNumber}"
  # starts the request/response cycle
  start = ->
    getLine (line) ->
      request line, (replyMsg) ->
        im.info "reply received:"
        im.received replyMsg
        start()

      im.info "request sent"
      im.info "waiting for reply"

  start()

im.pull = (portNumber, messagePort) ->
  pull = messagePort
  im.info "started pull socket on port #{portNumber}"
  pull (pushedMsg) ->
    im.info "message received:"
    im.received pushedMsg

im.push = (portNumber, messagePort, getLine) ->
  push = messagePort
  im.info "started push socket on port #{portNumber}"
  getAndPushMsg = ->
    getLine (line) ->
      push line
      im.info "message sent"
      getAndPushMsg()

  getAndPushMsg()

# these arrows should be reversed
im.info      = (msg) -> console.log '- ' + msg
im.received  = (msg) -> console.log '> ' + msg

# --

typeAliases =
  request: 'req', reply: 'rep', publish: 'pub', subscribe: 'sub'

typeExp = /// ^ rep | req | push | pull | pub | sub $ ///
portExp = /// ^ \d+ $ ///

# todo
validateType = (type) ->
  unless typeExp.test type
    console.log "#{type} isn't a valid message port type"
    printUsageAndExitWithError()

validatePort = (port) ->
  # todo: validate port in range
  unless portExp.test port
    console.log "#{port} isn't a valid port number"
    printUsageAndExitWithError()

printUsageAndExitWithError = ->
  console.log usage
  process.exit 1

# todo: expand
usage = """
usage: mp reply 2000
"""

# --

# poor mans bin file
run process.argv[2..-1]
