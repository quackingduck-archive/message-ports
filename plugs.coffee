# Plugs
# =====
#
# Plugs. They're sockets from the future.

zmq = require 'zmq'

# Binary is the default. Messages are passed to callbacks as Buffer objects
messageFormat = 'binary'
@messageFormat = (format) -> messageFormat = format

parse = (buffer) ->
  switch messageFormat
    when 'utf8' then buffer.toString 'utf8'
    else buffer

serialize = (object) ->
  switch messageFormat
    when 'utf8' then new Buffer object
    else object

# Request/Reply Messaging

@reply = (urls...) ->
  zmqSocket = zmq.createSocket 'rep'
  for url in urls
    zmqSocket.bindSync url, (error) ->
      throw "can't bind to #{url}" if error?

  responder = (msg) ->
    zmqSocket.send serialize msg

  goodSocket = (callback) ->
    zmqSocket.on 'message', (buffer) ->
      callback parse(buffer), responder

  goodSocket.socket = zmqSocket
  goodSocket

# alias
@rep = @reply

@request = (urls...) ->
  zmqSocket = zmq.createSocket 'req'
  for url in urls
    zmqSocket.connect url

  goodSocket = (msg, callback) ->
    zmqSocket.on 'message', (buffer) ->
      callback parse(buffer)
    zmqSocket.send serialize msg

  goodSocket.socket = zmqSocket
  goodSocket

# alias
@req = @request

# Unidirectional (Pipeline) Messaging

@pull = (urls...) ->
  zmqSocket = zmq.createSocket 'pull'
  for url in urls
    zmqSocket.bindSync url, (error) ->
      throw "can't bind to #{url}" if error?

  plug = (callback) ->
    zmqSocket.on 'message', (buffer) ->
      callback parse(buffer)

  plug.socket = zmqSocket
  plug

@push = (urls...) ->
  zmqSocket = zmq.createSocket 'push'
  zmqSocket.connect url for url in urls

  plug = (msg) ->
    zmqSocket.send serialize msg

  plug.socket = zmqSocket
  plug

# Publish/Subscribe Messaging

@publish = (urls...) ->
  zmqSocket = zmq.createSocket 'pub'
  zmqSocket.bindSync url for url in urls

  plug = (msg) ->
    zmqSocket.send serialize msg

  plug.socket = zmqSocket
  plug

@pub = @publish

@subscribe = (urls...) ->
  zmqSocket = zmq.createSocket 'sub'
  zmqSocket.connect url for url in urls
  # subcribe to all messages (i.e. don't filter them based on a prefix)
  zmqSocket.subscribe ''

  plug = (callback) ->
    zmqSocket.on 'message', (buffer) ->
      callback parse(buffer)

  plug.socket = zmqSocket
  plug

@sub = @subscribe
