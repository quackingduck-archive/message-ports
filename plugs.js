(function() {
  var messageFormat, parse, serialize, zmq;
  var __slice = Array.prototype.slice;
  zmq = require('zmq');
  messageFormat = 'binary';
  this.messageFormat = function(format) {
    return messageFormat = format;
  };
  parse = function(buffer) {
    switch (messageFormat) {
      case 'utf8':
        return buffer.toString('utf8');
      default:
        return buffer;
    }
  };
  serialize = function(object) {
    switch (messageFormat) {
      case 'utf8':
        return new Buffer(object);
      default:
        return object;
    }
  };
  this.reply = function() {
    var goodSocket, responder, url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    zmqSocket = zmq.createSocket('rep');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.bindSync(url, function(error) {
        if (error != null) {
          throw "can't bind to " + url;
        }
      });
    }
    responder = function(msg) {
      return zmqSocket.send(serialize(msg));
    };
    goodSocket = function(callback) {
      return zmqSocket.on('message', function(buffer) {
        return callback(parse(buffer), responder);
      });
    };
    goodSocket.socket = zmqSocket;
    return goodSocket;
  };
  this.rep = this.reply;
  this.request = function() {
    var goodSocket, url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    zmqSocket = zmq.createSocket('req');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.connect(url);
    }
    goodSocket = function(msg, callback) {
      zmqSocket.on('message', function(buffer) {
        return callback(parse(buffer));
      });
      return zmqSocket.send(serialize(msg));
    };
    goodSocket.socket = zmqSocket;
    return goodSocket;
  };
  this.req = this.request;
  this.pull = function() {
    var plug, url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    zmqSocket = zmq.createSocket('pull');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.bindSync(url, function(error) {
        if (error != null) {
          throw "can't bind to " + url;
        }
      });
    }
    plug = function(callback) {
      return zmqSocket.on('message', function(buffer) {
        return callback(parse(buffer));
      });
    };
    plug.socket = zmqSocket;
    return plug;
  };
  this.push = function() {
    var plug, url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    zmqSocket = zmq.createSocket('push');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.connect(url);
    }
    plug = function(msg) {
      return zmqSocket.send(serialize(msg));
    };
    plug.socket = zmqSocket;
    return plug;
  };
  this.publish = function() {
    var plug, url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    zmqSocket = zmq.createSocket('pub');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.bindSync(url);
    }
    plug = function(msg) {
      return zmqSocket.send(serialize(msg));
    };
    plug.socket = zmqSocket;
    return plug;
  };
  this.pub = this.publish;
  this.subscribe = function() {
    var plug, url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    zmqSocket = zmq.createSocket('sub');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.connect(url);
    }
    zmqSocket.subscribe('');
    plug = function(callback) {
      return zmqSocket.on('message', function(buffer) {
        return callback(parse(buffer));
      });
    };
    plug.socket = zmqSocket;
    return plug;
  };
  this.sub = this.subscribe;
}).call(this);
