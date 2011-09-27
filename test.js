(function() {
  var ms, testCase;
  ms = require('./');
  testCase = require('nodeunit').testCase;
  this["Basic Usage"] = testCase({
    setUp: function(proceed) {
      ms.messageFormat = 'utf8';
      return proceed();
    },
    "basic client server communication (like HTTP)": function(test) {
      var msPath, reply, request;
      test.expect(2);
      msPath = 'ipc:///tmp/test.ms';
      reply = ms.reply(msPath);
      reply(function(msg, send) {
        test.strictEqual(msg, "status?");
        return send("good!");
      });
      request = ms.request(msPath);
      return request("status?", function(msg) {
        test.strictEqual(msg, "good!");
        request.close();
        reply.close();
        return test.done();
      });
    },
    "basic unidirectional messaging (like unix pipes)": function(test) {
      var msPath, pull, push;
      test.expect(1);
      msPath = 'ipc:///tmp/test.ms';
      pull = ms.pull(msPath);
      pull(function(msg) {
        test.strictEqual(msg, 'hai');
        push.close();
        pull.close();
        return test.done();
      });
      push = ms.push(msPath);
      return push('hai');
    },
    "basic broadcast messaging (like RSS)": function(test) {
      var msPath, publish, subscribe;
      test.expect(1);
      msPath = 'ipc:///tmp/test.ms';
      subscribe = ms.subscribe(msPath);
      subscribe(function(msg) {
        return test.strictEqual(msg, 'broadcast');
      });
      publish = ms.publish(msPath);
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
      var msPath, pull, push;
      test.expect(1);
      msPath = 'ipc:///tmp/test-json.ms';
      ms.messageFormat = 'json';
      pull = ms.pull(msPath);
      pull(function(msg) {
        test.deepEqual(msg, {
          msg: 'hai',
          arr: [1, 2, 3]
        });
        push.close();
        pull.close();
        return test.done();
      });
      push = ms.push(msPath);
      return push({
        msg: 'hai',
        arr: [1, 2, 3]
      });
    },
    "msgpack": function(test) {
      var msPath, pull, push;
      test.expect(1);
      msPath = 'ipc:///tmp/test-json.ms';
      ms.messageFormat = 'msgpack';
      pull = ms.pull(msPath);
      pull(function(msg) {
        test.deepEqual(msg, {
          msg: 'hai',
          arr: [1, 2, 3]
        });
        push.close();
        pull.close();
        return test.done();
      });
      push = ms.push(msPath);
      return push({
        msg: 'hai',
        arr: [1, 2, 3]
      });
    }
  });
}).call(this);
