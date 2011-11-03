mp = require './'

# entry point
run = (args) ->
  type = args.shift()
  validateType type
  port = args.shift()
  validatePort port
  port = parseInt port
  if args.length is 0
    interactiveMode type, port
  else
    # todo: fancy command mode
    exitWithErrorAndPrintUsage()

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

interactiveModes.reply = (portNumber, messagePort, getLine) ->
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

interactiveModes.request = (portNumber, messagePort, getLine) ->
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

# todo
validateType = (type) ->
validatePort = (port) ->
exitWithErrorAndPrintUsage = ->
  console.log "usage: mp reply 2000"
  process.exit 1

logInfo = (msg) -> console.log '- ' + msg
# these arrows should be reversed
logReceived  = (msg) -> console.log '< ' + msg

# --

run process.argv[2..-1]
