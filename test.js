(function() {
  var plug, testCase;
  plug = require('./');
  testCase = require('nodeunit').testCase;
  plug.messageFormat('utf8');
  module.exports = testCase({
    "basic client server communication (like HTTP)": function(test) {
      var plugPath, reply, request;
      test.expect(2);
      plugPath = 'ipc:///tmp/test.plug';
      reply = plug.reply(plugPath);
      reply(function(msg, send) {
        test.equals(msg, "status?");
        return send("good!");
      });
      request = plug.request(plugPath);
      return request("status?", function(msg) {
        test.equals(msg, "good!");
        request.close();
        reply.close();
        return test.done();
      });
    },
    "basic unidirectional messaging (like unix pipes)": function(test) {
      var plugPath, pull, push;
      test.expect(1);
      plugPath = 'ipc:///tmp/test.plug';
      pull = plug.pull(plugPath);
      pull(function(msg) {
        test.equal(msg, 'hai');
        push.close();
        pull.close();
        return test.done();
      });
      push = plug.push(plugPath);
      return push('hai');
    },
    "basic broadcast messaging (like RSS)": function(test) {
      var plugPath, publish, subscribe;
      test.expect(1);
      plugPath = 'ipc:///tmp/test.plug';
      subscribe = plug.subscribe(plugPath);
      subscribe(function(msg) {
        return test.equal(msg, 'broadcast');
      });
      publish = plug.publish(plugPath);
      setTimeout(function() {
        return publish('broadcast');
      }, 200);
      return setTimeout(function() {
        publish.close();
        subscribe.close();
        return test.done();
      }, 210);
    }
  });
}).call(this);
