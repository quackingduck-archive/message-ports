(function() {
  var ms, randomPort, testCase;
  ms = require('./');
  testCase = require('nodeunit').testCase;
  this["Basic Usage"] = testCase({
    setUp: function(proceed) {
      ms.messageFormat = 'utf8';
      return proceed();
    },
    "basic client server communication (like HTTP)": function(test) {
      var port, reply, request;
      test.expect(2);
      port = randomPort();
      reply = ms.reply(port);
      reply(function(msg, send) {
        test.strictEqual(msg, "status?");
        return send("good!");
      });
      request = ms.request(port);
      return request("status?", function(msg) {
        test.strictEqual(msg, "good!");
        request.close();
        reply.close();
        return test.done();
      });
    },
    "basic unidirectional messaging (like unix pipes)": function(test) {
      var port, pull, push;
      test.expect(1);
      port = randomPort();
      pull = ms.pull(port);
      pull(function(msg) {
        test.strictEqual(msg, 'hai');
        push.close();
        pull.close();
        return test.done();
      });
      push = ms.push(port);
      return push('hai');
    },
    "basic broadcast messaging (like RSS)": function(test) {
      var port, publish, subscribe;
      test.expect(1);
      port = randomPort();
      subscribe = ms.subscribe(port);
      subscribe(function(msg) {
        return test.strictEqual(msg, 'broadcast');
      });
      publish = ms.publish(port);
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
      var port, pull, push;
      test.expect(1);
      port = randomPort();
      ms.messageFormat = 'json';
      pull = ms.pull(port);
      pull(function(msg) {
        test.deepEqual(msg, {
          msg: 'hai',
          arr: [1, 2, 3]
        });
        push.close();
        pull.close();
        return test.done();
      });
      push = ms.push(port);
      return push({
        msg: 'hai',
        arr: [1, 2, 3]
      });
    },
    "msgpack": function(test) {
      var port, pull, push;
      test.expect(1);
      port = randomPort();
      ms.messageFormat = 'msgpack';
      pull = ms.pull(port);
      pull(function(msg) {
        test.deepEqual(msg, {
          msg: 'hai',
          arr: [1, 2, 3]
        });
        push.close();
        pull.close();
        return test.done();
      });
      push = ms.push(port);
      return push({
        msg: 'hai',
        arr: [1, 2, 3]
      });
    }
  });
  this["req/rep"] = testCase({
    setUp: function(proceed) {
      ms.messageFormat = 'utf8';
      return proceed();
    },
    "multiple requests": function(test) {
      var port, reply, replyCount, request;
      test.expect(2);
      port = randomPort();
      replyCount = 0;
      reply = ms.reply(port);
      reply(function(msg, send) {
        return send("good! " + (replyCount += 1));
      });
      request = ms.request(port);
      return request("status?", function(msg) {
        test.strictEqual(msg, "good! 1");
        return request("status?", function(msg) {
          test.strictEqual(msg, "good! 2");
          request.close();
          reply.close();
          return test.done();
        });
      });
    }
  });
  this["internals"] = testCase({
    "zmqUrls": function(test) {
      test.expect(1);
      test.deepEqual(ms._test.zmqUrls([2000, 3000]), ["tcp://127.0.0.1:2000", "tcp://127.0.0.1:3000"]);
      return test.done();
    }
  });
  randomPort = function() {
    return Math.round(Math.random() * 10 + 2000);
  };
}).call(this);
