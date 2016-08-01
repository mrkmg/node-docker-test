var util, EventEmitter, extend, pad;

EventEmitter = require('events');
Util = require('util');
pad = require('pad');
extend = require('extend');

Util.inherits(RunCli, EventEmitter);

function RunCli(name)
{
    console.log('Node Docker Test - ' + name);
    this.runnerIdWidth = 1;
}

RunCli.prototype.started = function started()
{
    console.log('Starting Tests');
    console.log('');
    this.log('Runner', 'Version', 'Status');
    this.log('--------', '--------', '--------');
};

RunCli.prototype.finished = function finished(results)
{
    var passed = [];
    var failed = [];

    results.forEach(function (result)
    {
        result.passed ? passed.push(result) : failed.push(result);
    });

    console.log('');
    console.log('Passed Tests:\t' + passed.length);
    console.log('Failed Tests:\t' + failed.length);
    console.log('');

    if (failed.length)
    {
        console.log('Failed Versions:\t' + failed.map(function (result)
            {
                return 'v' + result.version;
            }).join(', '));

        process.exit(failed.length);
    }
    else
    {
        this.emit('finished');
    }
};

RunCli.prototype.testStarted = function testStarted(test)
{
    this.log(this._runnerId(test.runner), test.version, 'Started');
};

RunCli.prototype.testData = function testData(test)
{
};

RunCli.prototype.testFinished = function testFinished(test)
{
    this.log(this._runnerId(test.runner), test.version, test.result ? 'Passed' : 'Failed');
};

RunCli.prototype.runnerStarted = function runnerStarted(runner)
{
    this.log(this._runnerId(runner), '', 'Started');
};

RunCli.prototype.runnerFinished = function runnerFinished(runner)
{
    this.log(this._runnerId(runner), '', 'Finished');
};

RunCli.prototype.initialize = function (concurrency)
{
    this.runnerIdWidth = (concurrency - 1).toString().length;
};

RunCli.prototype.destroy = function ()
{
};

RunCli.prototype.log = function log(c1, c2, c3)
{
    console.log(' ' + pad(c1, 9) + '| ' + pad(c2, 9) + '| ' + pad(c3, 9));
};

RunCli.prototype._runnerId = function _runnerId(id)
{
    return pad(this.runnerIdWidth, id.toString(), '0');
};

module.exports = RunCli;
