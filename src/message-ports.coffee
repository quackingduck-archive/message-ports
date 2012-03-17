# Message Ports
# =============
#
# Sockets from the future.

zmq = require 'zmq'
# c.f.: https://github.com/JustinTulloss/zeromq.node/issues/86
zmq.createSocket = zmq.socket if zmq.socket?

# Binary is the default serialization format. Messages are passed to callbacks
# as `Buffer` objects
messageFormat = 'binary'

@__defineSetter__ 'messageFormat', (format) =>
  messageFormat = switch format
    when 'utf8', 'string' then 'utf8'
    when 'binary' then format
    when 'json', 'JSON' then 'json'
    when 'msgpack'
      @msgpack = require 'msgpack2'
      'msgpack'
    else throw new Error "unkown message format: #{format}"

@__defineGetter__ 'messageFormat', -> messageFormat

# Request/Reply Messaging

@reply = (urls...) ->
  urls = zmqUrls urls
  zmqSocket = zmq.createSocket 'rep'
  for url in urls
    zmqSocket.bindSync url, (error) ->
      throw "can't bind to #{url}" if error?

  send = (msg) ->
    zmqSocket.send serialize msg

  createMSocket zmqSocket, (callback) ->
    zmqSocket.on 'message', (buffer) ->
      callback parse(buffer), send

# alias
@rep = @reply

@request = (urls...) ->
  urls = zmqUrls urls
  zmqSocket = zmq.createSocket 'req'
  for url in urls
    zmqSocket.connect url

  receive = null
  zmqSocket.on 'message', (buffer) ->
    receive parse(buffer)

  createMSocket zmqSocket, (msg, callback) ->
    receive = callback
    zmqSocket.send serialize msg

# alias
@req = @request


# Unidirectional (Pipeline) Messaging

@pull = (urls...) ->
  urls = zmqUrls urls
  zmqSocket = zmq.createSocket 'pull'
  for url in urls
    zmqSocket.bindSync url, (error) ->
      throw "can't bind to #{url}" if error?

  createMSocket zmqSocket, (callback) ->
    zmqSocket.on 'message', (buffer) ->
      callback parse(buffer)

@push = (urls...) ->
  urls = zmqUrls urls
  zmqSocket = zmq.createSocket 'push'
  zmqSocket.connect url for url in urls

  createMSocket zmqSocket, (msg) ->
    zmqSocket.send serialize msg


# Publish/Subscribe Messaging

@publish = (urls...) ->
  urls = zmqUrls urls
  zmqSocket = zmq.createSocket 'pub'
  zmqSocket.bindSync url for url in urls

  createMSocket zmqSocket, (msg) ->
    zmqSocket.send serialize msg

@pub = @publish

@subscribe = (urls...) ->
  urls = zmqUrls urls
  zmqSocket = zmq.createSocket 'sub'
  zmqSocket.connect url for url in urls
  # subcribe to all messages (i.e. don't filter them based on a prefix)
  zmqSocket.subscribe ''

  createMSocket zmqSocket, (callback) ->
    zmqSocket.on 'message', (buffer) ->
      callback parse(buffer)

@sub = @subscribe

# Implementation

# Annotates the function `f` with a reference to the zmq socket and adds a
# `close()` method
createMSocket = (zmqSocket, f) ->
  f.socket = zmqSocket
  f.close = -> zmqSocket.close()
  f

zmqUrls = (urls) ->
  for url in urls
    if typeof url is 'number'
      "tcp://127.0.0.1:#{url}"
    else
      url

parse = (buffer) =>
  switch @messageFormat
    when 'utf8' then buffer.toString 'utf8'
    when 'json' then JSON.parse buffer.toString 'utf8'
    when 'msgpack' then @msgpack.unpack buffer
    else buffer

serialize = (object) =>
  switch @messageFormat
    when 'utf8' then new Buffer object
    when 'json' then new Buffer JSON.stringify(object)
    when 'msgpack' then @msgpack.pack object
    else object

module.exports._test = {zmqUrls}