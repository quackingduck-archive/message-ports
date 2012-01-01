(function() {
  var createMSocket, messageFormat, parse, serialize, zmq, zmqUrls,
    _this = this,
    __slice = Array.prototype.slice;

  zmq = require('zmq');

  messageFormat = 'binary';

  this.__defineSetter__('messageFormat', function(format) {
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
    }).call(_this);
  });

  this.__defineGetter__('messageFormat', function() {
    return messageFormat;
  });

  this.reply = function() {
    var send, url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    urls = zmqUrls(urls);
    zmqSocket = zmq.createSocket('rep');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.bindSync(url, function(error) {
        if (error != null) throw "can't bind to " + url;
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
    var receive, url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    urls = zmqUrls(urls);
    zmqSocket = zmq.createSocket('req');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.connect(url);
    }
    receive = null;
    zmqSocket.on('message', function(buffer) {
      return receive(parse(buffer));
    });
    return createMSocket(zmqSocket, function(msg, callback) {
      receive = callback;
      return zmqSocket.send(serialize(msg));
    });
  };

  this.req = this.request;

  this.pull = function() {
    var url, urls, zmqSocket, _i, _len;
    urls = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    urls = zmqUrls(urls);
    zmqSocket = zmq.createSocket('pull');
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      zmqSocket.bindSync(url, function(error) {
        if (error != null) throw "can't bind to " + url;
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
    urls = zmqUrls(urls);
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
    urls = zmqUrls(urls);
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
    urls = zmqUrls(urls);
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

  zmqUrls = function(urls) {
    var url, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = urls.length; _i < _len; _i++) {
      url = urls[_i];
      if (typeof url === 'number') {
        _results.push("tcp://127.0.0.1:" + url);
      } else {
        _results.push(url);
      }
    }
    return _results;
  };

  parse = function(buffer) {
    switch (_this.messageFormat) {
      case 'utf8':
        return buffer.toString('utf8');
      case 'json':
        return JSON.parse(buffer.toString('utf8'));
      case 'msgpack':
        return _this.msgpack.unpack(buffer);
      default:
        return buffer;
    }
  };

  serialize = function(object) {
    switch (_this.messageFormat) {
      case 'utf8':
        return new Buffer(object);
      case 'json':
        return new Buffer(JSON.stringify(object));
      case 'msgpack':
        return _this.msgpack.pack(object);
      default:
        return object;
    }
  };

  module.exports._test = {
    zmqUrls: zmqUrls
  };

}).call(this);
