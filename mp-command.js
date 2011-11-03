(function() {
  var exitWithErrorAndPrintUsage, interactiveMode, interactiveModes, logInfo, logReceived, mp, run, validatePort, validateType;
  mp = require('./');
  run = function(args) {
    var port, type;
    type = args.shift();
    validateType(type);
    port = args.shift();
    validatePort(port);
    port = parseInt(port);
    if (args.length === 0) {
      return interactiveMode(type, port);
    } else {
      return exitWithErrorAndPrintUsage();
    }
  };
  interactiveMode = function(type, port) {
    var getLine, input, messagePort;
    process.stdin.setEncoding('utf8');
    input = require('readline').createInterface(process.stdin, process.stdout);
    input.setPrompt('> ');
    mp.messageFormat = 'utf8';
    messagePort = mp[type](port);
    input.on('close', function() {
      process.stdout.write('\n');
      process.stdin.destroy();
      return messagePort.close();
    });
    getLine = function(callback) {
      input.once('line', callback);
      return input.prompt();
    };
    return interactiveModes[type](port, messagePort, getLine);
  };
  interactiveModes = {};
  interactiveModes.reply = function(portNumber, messagePort, getLine) {
    var reply;
    reply = messagePort;
    logInfo("started reply socket on port " + portNumber);
    logInfo("waiting for request");
    return reply(function(msg, send) {
      logInfo("request received:");
      logReceived(msg);
      return getLine(function(line) {
        send(line);
        logInfo("reply sent");
        return logInfo("waiting for request");
      });
    });
  };
  interactiveModes.request = function(portNumber, messagePort, getLine) {
    var request, start;
    request = messagePort;
    logInfo("started request socket on port " + portNumber);
    start = function() {
      return getLine(function(line) {
        request(line, function(msg) {
          logInfo("reply received:");
          logReceived(msg);
          return start();
        });
        logInfo("request sent");
        return logInfo("waiting for reply");
      });
    };
    return start();
  };
  validateType = function(type) {};
  validatePort = function(port) {};
  exitWithErrorAndPrintUsage = function() {
    console.log("usage: mp reply 2000");
    return process.exit(1);
  };
  logInfo = function(msg) {
    return console.log('- ' + msg);
  };
  logReceived = function(msg) {
    return console.log('< ' + msg);
  };
  run(process.argv.slice(2));
}).call(this);
