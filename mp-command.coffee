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
  input.setPrompt '> '

  mp.messageFormat = 'utf8'
  messagePort = mp[type](port)

  input.on 'close', ->
    process.stdout.write '\n'
    process.stdin.destroy()
    messagePort.close()

  getLine = (callback) ->
    input.once 'line', callback
    input.prompt()

  interactiveModes[type](port, messagePort, getLine)

interactiveModes = {}

interactiveModes.rep = (portNumber, messagePort, getLine) ->
  reply = messagePort
  logInfo "started reply socket on port #{portNumber}"
  logInfo "waiting for request"
  reply (msg, send) ->
    logInfo "request received:"
    logReceived msg
    getLine (line) ->
      send line
      logInfo "reply sent"
      logInfo "waiting for request"

interactiveModes.req = (portNumber, messagePort, getLine) ->
  request = messagePort
  logInfo "started request socket on port #{portNumber}"
  # starts the request/response cycle
  start = ->
    getLine (line) ->
      request line, (msg) ->
        logInfo "reply received:"
        logReceived msg
        start()

      logInfo "request sent"
      logInfo "waiting for reply"

  start()

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

logInfo = (msg) -> console.log '- ' + msg
# these arrows should be reversed
logReceived  = (msg) -> console.log '< ' + msg

# --

# poor mans bin file
run process.argv[2..-1]
