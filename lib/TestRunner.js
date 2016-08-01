var Docker, Promise, Test, EventEmitter, Util;

Promise = require('bluebird');
Docker = require('./utils/Docker');
Test = require('./Test');
EventEmitter = require('events');
Util = require('util');

Util.inherits(TestRunner, EventEmitter);

function TestRunner(opts, versions)
{
    this._opts = opts;
    this.versions = versions;
    this.concurrency = Math.min(this.versions.length, this._opts.concurrency);
}

TestRunner.prototype.start = function run()
{
    var self = this,
        tests = [];

    return Promise
        .try(function ()
        {
            return Docker.containerExists('ndt:' + self._opts.name);
        })
        .then(function (exists)
        {
            if (!exists)
            {
                throw new Error("Please run setup first.");
            }
        })
        .then(function ()
        {
            tests = self.versions.map(function (version)
            {
                return new Test(version, self._opts.name, self._opts.commands);
            });
        })
        .then(function ()
        {
            self.emit('started');
            return self.runTests(tests);
        })
        .then(function (results)
        {
            self.emit('finished', results);
            return results;
        });
};

// Well, this is complicated, isn't it?
// Can I make this less confusing
TestRunner.prototype.runTests = function runTests(tests)
{
    var self = this;

    var i = -1;

    return Promise
        .try(function ()
        {
            var results = [];
            var testRunners = [];

            var next = function (test_id)
            {
                if (++i < tests.length)
                {
                    var test = tests[i];
                    return Promise
                        .try(function ()
                        {
                            test.on('data', function (data)
                            {
                                self.emit('testData', {
                                    runner: test_id,
                                    version: test.version,
                                    data: data
                                })
                            });

                            self.emit('testStarted', {
                                runner: test_id,
                                version: test.version
                            });

                            return test.run();
                        })
                        .then(function (result)
                        {
                            var r = {
                                runner: test_id,
                                version: test.version,
                                passed: result.passed,
                                data: test.data
                            };

                            self.emit('testFinished', r);
                            test.removeAllListeners('data');
                            results.push(r);
                        })
                        .then(function ()
                        {
                            return next(test_id);
                        });
                }
                else
                {
                    self.emit('runnerFinished', test_id);
                    return true;
                }
            };

            for (var test_id = 0; test_id < self.concurrency; test_id++)
            {
                self.emit('runnerStarted', test_id);

                testRunners.push(next(test_id));
            }

            return Promise.all(testRunners).then(function ()
            {
                return results;
            });
        });
};

module.exports = TestRunner;
