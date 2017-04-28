/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <https://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
var Promise, Commands, Docker, Util;

Promise      = require('bluebird');
EventEmitter = require('events');
Util         = require('util');

Commands = require('./utils/Commands');
Docker   = require('./utils/Docker');

Util.inherits(SetupRunner, EventEmitter);

module.exports = SetupRunner;

function SetupRunner(opts) {
    this.parseOpts(opts);
}

SetupRunner.prototype.parseOpts = function parseArgs(opts) {
    this._name           = opts.name;
    this._versions       = opts.versions;
    this._commands       = opts.commands;
    this._reset          = opts.reset;
    this._baseImage      = opts.baseImage;
    this._packageManager = opts.packageManager;
    this._yarn           = opts.yarn;
};

SetupRunner.prototype.start = function start() {
    return Promise
        .bind(this)
        .return(this._name)
        .then(Docker.containerExists)
        .then(determineBaseImage)
        .then(function (image) {
            this._baseImage = image;
        })
        .return(this._versions)
        .then(doSetup)
};

function determineBaseImage(exists) {
    var self = this;

    if (!exists) {
        return Promise.resolve(this._baseImage);
    }

    if (this._reset) {
        return Docker.removeContainer(this._name).then(function () {
            return self._baseImage;
        });
    }

    return Promise.resolve(this._name);
}

function doSetup(versions) {
    var self = this;

    return Docker.makeNew(self._name, Commands.setup(versions, self._commands, self._packageManager, self._yarn), self._baseImage, function (data) {
        self.emit('data', data.toString());
    });
}
