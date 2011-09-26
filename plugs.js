(function() {
  var createPlug, messageFormat, parse, serialize, zmq;
  var __slice = Array.prototype.slice;
  zmq = require('zmq');
  messageFormat = 'binary';
  this.messageFormat = function(format) {
    return messageFormat = format;
  };
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
    return createPlug(zmqSocket, function(callback) {
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
    return createPlug(zmqSocket, function(msg, callback) {
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
    return createPlug(zmqSocket, function(callback) {
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
    return createPlug(zmqSocket, function(msg) {
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
    return createPlug(zmqSocket, function(msg) {
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
    return createPlug(zmqSocket, function(callback) {
      return zmqSocket.on('message', function(buffer) {
        return callback(parse(buffer));
      });
    });
  };
  this.sub = this.subscribe;
  createPlug = function(zmqSocket, f) {
    f.socket = zmqSocket;
    f.close = function() {
      return zmqSocket.close();
    };
    return f;
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
}).call(this);
