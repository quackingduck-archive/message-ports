(function() {
  var plug, testCase;
  plug = require('./');
  testCase = require('nodeunit').testCase;
  this["Basic Usage"] = testCase({
    setUp: function(proceed) {
      plug.messageFormat = 'utf8';
      return proceed();
    },
    "basic client server communication (like HTTP)": function(test) {
      var plugPath, reply, request;
      test.expect(2);
      plugPath = 'ipc:///tmp/test.plug';
      reply = plug.reply(plugPath);
      reply(function(msg, send) {
        test.strictEqual(msg, "status?");
        return send("good!");
      });
      request = plug.request(plugPath);
      return request("status?", function(msg) {
        test.strictEqual(msg, "good!");
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
        test.strictEqual(msg, 'hai');
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
        return test.strictEqual(msg, 'broadcast');
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
  this["Message formatting"] = testCase({
    "JSON": function(test) {
      var plugPath, pull, push;
      test.expect(1);
      plugPath = 'ipc:///tmp/test-json.plug';
      plug.messageFormat = 'json';
      pull = plug.pull(plugPath);
      pull(function(msg) {
        test.deepEqual(msg, {
          msg: 'hai',
          arr: [1, 2, 3]
        });
        push.close();
        pull.close();
        return test.done();
      });
      push = plug.push(plugPath);
      return push({
        msg: 'hai',
        arr: [1, 2, 3]
      });
    }
  });
}).call(this);
