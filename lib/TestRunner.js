/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <https://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
var Docker, Promise, Test, EventEmitter, Util;

Promise      = require('bluebird');
Docker       = require('./utils/Docker');
Test         = require('./Test');
EventEmitter = require('events');
Util         = require('util');

module.exports = TestRunner;

Util.inherits(TestRunner, EventEmitter);

function TestRunner(opts) {
    this.parseOpts(opts);
    this._running = false;
}

TestRunner.prototype.parseOpts = function parseOpts(opts) {
    this._name       = opts.name;
    this._versions   = opts.versions;
    this._commands   = opts.commands;
    this._yarn       = opts.yarn;
    this.concurrency = Math.min(this._versions.length, opts.concurrency);
};

TestRunner.prototype.start = function run() {
    if (this._running) {
        return false;
    }

    this._cancel_test = false;
    this._running     = true;

    return Promise
        .bind(this)
        .return(this._name)
        .then(Docker.containerExists)
        .then(function (exists) {
            if (!exists) {
                return Promise.reject("Please run setup first.");
            }
        })
        .return(this._versions)
        .map(makeTest)
        .tap(function (tests) {
            this.tests = tests;
            this.emit('started');
        })
        .then(runTests)
        .tap(function (results) {
            this.emit('finished', results);
            this._running = false;
        });
};

TestRunner.prototype.stop = function () {
    var self = this;

    self._cancel_test = true;

    if (self.tests) {
        self.tests.forEach(function (test) {
            test.stop();
        });
    }
};

function runTests(tests) {
    var self = this;

    var results = [];
    var runners = [];

    var currentTest = -1;

    function next(runner_id) {
        currentTest++;

        if (self._cancel_test || currentTest >= tests.length) {
            self.emit('runnerFinished', runner_id);
            return true;
        }

        return runTest.bind(self)(runner_id, tests[currentTest])
            .then(function (result) {
                results.push(result);
                return next(runner_id);
            });
    }

    for (var runner_id = 0; runner_id < self.concurrency; runner_id++) {
        self.emit('runnerStarted', runner_id);

        runners.push(next(runner_id));
    }

    return Promise.all(runners).then(function () { return results; });

}

function runTest(runner, test) {
    var self = this;
    return Promise
        .try(function () {
            self.emit('testStarted', {
                runner: runner,
                version: test.version
            });

            test.on('data', function (data) {
                self.emit('testData', {
                    runner: runner,
                    version: test.version,
                    data: data
                })
            });

            return test.run();
        })
        .then(function (result) {
            var r = {
                runner: runner,
                version: test.version,
                passed: result.passed,
                data: test.data
            };

            self.emit('testFinished', r);
            test.removeAllListeners('data');
            return r;
        });
}

function makeTest(version) {
    return new Test(version, this._name, this._commands, this._yarn);
}
