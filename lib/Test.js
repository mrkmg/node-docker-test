var Promise, EventEmitter, util, Docker, Config, Commands;

EventEmitter = require('events');
util = require('util');
Promise = require('bluebird');

Docker = require('./Docker');
Config = require('./Config');
Commands = require('./Commands');

util.inherits(Test, EventEmitter);

function Test(version)
{
    this.version = version;
    this.result = '';
}

Test.prototype.run = function run()
{
    var self = this;

    return Promise
        .try(function ()
        {
            return Docker.runContainerWithCopy('ndt:' + Config.name, Commands.test(self.version), function (data)
            {
                self.result += data.toString();
                self.emit('data', data.toString());
            });
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

module.exports = Test;
