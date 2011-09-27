(function() {
  var createMSocket, messageFormat, parse, serialize, zmq;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  zmq = require('zmq');
  messageFormat = 'binary';
  this.__defineSetter__('messageFormat', __bind(function(format) {
    return messageFormat = (function() {
      switch (format) {
        case 'utf8':
        case 'string':
          return 'utf8';
        case 'binary':
          return format;
        case 'json':
        case 'JSON':
          return 'json';
        case 'msgpack':
          this.msgpack = require('msgpack2');
          return 'msgpack';
        default:
          throw new Error("unkown message format: " + format);
      }
    }).call(this);
  }, this));
  this.__defineGetter__('messageFormat', function() {
    return messageFormat;
  });
  this.reply = function() {
    var send, url, urls, zmqSocket, _i, _len;
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
    send = function(msg) {
      return zmqSocket.send(serialize(msg));
    };
    return createMSocket(zmqSocket, function(callback) {
      return zmqSocket.on('message', function(buffer) {
        return callback(parse(buffer), send);
      });
    });
  };
  this.rep = this.reply;
  this.request = function() {
    var url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    zmqSocket = zmq.createSocket('req');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.connect(url);
    }
    return createMSocket(zmqSocket, function(msg, callback) {
      zmqSocket.on('message', function(buffer) {
        return callback(parse(buffer));
      });
      return zmqSocket.send(serialize(msg));
    });
  };
  this.req = this.request;
  this.pull = function() {
    var url, urls, zmqSocket, _i, _len;
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
    return createMSocket(zmqSocket, function(callback) {
      return zmqSocket.on('message', function(buffer) {
        return callback(parse(buffer));
      });
    });
  };
  this.push = function() {
    var url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    zmqSocket = zmq.createSocket('push');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.connect(url);
    }
    return createMSocket(zmqSocket, function(msg) {
      return zmqSocket.send(serialize(msg));
    });
  };
  this.publish = function() {
    var url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    zmqSocket = zmq.createSocket('pub');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.bindSync(url);
    }
    return createMSocket(zmqSocket, function(msg) {
      return zmqSocket.send(serialize(msg));
    });
  };
  this.pub = this.publish;
  this.subscribe = function() {
    var url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    zmqSocket = zmq.createSocket('sub');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.connect(url);
    }
    zmqSocket.subscribe('');
    return createMSocket(zmqSocket, function(callback) {
      return zmqSocket.on('message', function(buffer) {
        return callback(parse(buffer));
      });
    });
  };
  this.sub = this.subscribe;
  createMSocket = function(zmqSocket, f) {
    f.socket = zmqSocket;
    f.close = function() {
      return zmqSocket.close();
    };
    return f;
  };
  parse = __bind(function(buffer) {
    switch (this.messageFormat) {
      case 'utf8':
        return buffer.toString('utf8');
      case 'json':
        return JSON.parse(buffer.toString('utf8'));
      case 'msgpack':
        return this.msgpack.unpack(buffer);
      default:
        return buffer;
    }
  }, this);
  serialize = __bind(function(object) {
    switch (this.messageFormat) {
      case 'utf8':
        return new Buffer(object);
      case 'json':
        return new Buffer(JSON.stringify(object));
      case 'msgpack':
        return this.msgpack.pack(object);
      default:
        return object;
    }
  }, this);
}).call(this);
