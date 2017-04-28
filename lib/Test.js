var Promise, EventEmitter, util, Docker, Commands;

EventEmitter = require('events');
Util = require('util');
Promise = require('bluebird');

Docker = require('./utils/Docker');
Commands = require('./utils/Commands');

Util.inherits(Test, EventEmitter);

function Test(version, name, commands)
{
    this.version = version;
    this.data = '';
    this.commands = commands;
    this.name = name;
}

Test.prototype.run = function run()
{
    var self = this;

    return Promise
        .try(function ()
        {
            var promise = Docker.runContainerWithCopy(self.name, Commands.test(self.version, self.commands), function (data)
            {
                self.data += data.toString();
                self.emit('data', data.toString());
            });
            self.process = promise.process;
            return promise;
        })
        .then(function ()
        {
            return {
                version: self.version,
                passed: true
            };
        })
        .catch(function ()
        {
            return {
                version: self.version,
                passed: false
            };
        });
};

Test.prototype.stop = function stop() {
    var self = this;

    if (self.process) {
        self.process.kill('SIGKILL');
    }
};

module.exports = Test;
