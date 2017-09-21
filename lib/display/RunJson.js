/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <https://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
var Promise, EventEmitter, extend, pad;

Promise      = require('bluebird');
EventEmitter = require('events');
Util         = require('util');
pad          = require('pad');
extend       = require('extend');

Util.inherits(RunJson, EventEmitter);

function RunJson(name) {
    console.error(name + ' - Node Docker Test');
}

RunJson.prototype.started = function started() {
    console.error('Starting tests');
};

RunJson.prototype.finished = function finished(results) {
    console.error('Finished Tests');

    var output = {};

    results.forEach(function (result) {
        output[result.version] = {
            passed: result.passed,
            data: result.data
        };
    });

    console.log(JSON.stringify(output));
};

RunJson.prototype.testStarted = function testStarted(test) {
    console.error(test.version + ' started');
};

RunJson.prototype.testData = function testData(test) {
};

RunJson.prototype.testFinished = function testFinished(test) {
    console.error(test.version + ' finished');
};

RunJson.prototype.runnerStarted = function runnerStarted(runner) {
};

RunJson.prototype.runnerFinished = function runnerFinished(runner) {
};

RunJson.prototype.showError = function showError(error) {
};

RunJson.prototype.initialize = function (concurrency) {
};

RunJson.prototype.destroy = function () {
};

module.exports = RunJson;
