var Promise, EventEmitter, util, Docker, Commands;

EventEmitter = require('events');
util = require('util');
Promise = require('bluebird');

Docker = require('./Docker');
Commands = require('./Commands');

util.inherits(Test, EventEmitter);

function Test(version, config)
{
    this.version = version;
    this.result = '';
    this.config = config;
}

Test.prototype.run = function run()
{
    var self = this;

    return Promise
        .try(function ()
        {
            return Docker.runContainerWithCopy('ndt:' + self.config.name, Commands.test(self.version, self.config), function (data)
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
