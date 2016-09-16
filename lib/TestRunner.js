var Docker, Promise, Test, EventEmitter, Util;

Promise = require('bluebird');
Docker = require('./utils/Docker');
Test = require('./Test');
EventEmitter = require('events');
Util = require('util');

module.exports = TestRunner;

Util.inherits(TestRunner, EventEmitter);

function TestRunner(opts)
{
    this.parseOpts(opts);
    this._running = false;
}

TestRunner.prototype.parseOpts = function parseOpts(opts)
{
    this._name = opts.name;
    this._versions = opts.versions;
    this._commands = opts.commands;
    this.concurrency = Math.min(this._versions.length, opts.concurrency);
};

TestRunner.prototype.start = function run()
{
    if (this._running)
    {
        return false;
    }

    this._cancel_test = false;
    this._running = true;

    return Promise
        .bind(this)
        .return(this._name)
        .then(Docker.containerExists)
        .then(function (exists)
        {
            if (!exists) return Promise.reject("Please run setup first.");
        })
        .return(this._versions)
        .map(makeTest)
        .tap(function ()
        {
            this.emit('started');
        })
        .then(runTests)
        .tap(function (results)
        {
            this.emit('finished', results);
            this._running = false;
        });
};

TestRunner.prototype.stop = function ()
{
    var self = this;

    self._cancel_test = true;
};

function runTests(tests)
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
                if (++i < tests.length && !self._cancel_test)
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

function makeTest(version)
{
    return new Test(version, this._name, this._commands);
}
