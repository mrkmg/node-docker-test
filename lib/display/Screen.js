var util, EventEmitter, Blessed;

EventEmitter = require('events');
util = require('util');
Blessed = require('blessed');
Config = require('../Config');

util.inherits(Screen, EventEmitter);

function makeSingleton()
{
    return new Screen();
}

function Screen() {
    var self = this;

    self.initialized = false;

    self.on('updated', this.render);
}

Screen.prototype.intialize = function intialize()
{
    var self = this, title;


    title = 'Node Docker Test - ' + Config.name;

    self.screen = Blessed.screen({
        smartCSR: true
    });

    self.screen.key(['escape', 'C-c'], function ()
    {
        self.emit('userKill');
    });

    self.screen.title = title;

    self.title = Blessed.text({
        parent: self.screen,
        top: 0,
        left: 'center',
        width: title.length,
        height: 1,
        content: title
    });

    self.body = Blessed.box({
        parent: self.screen,
        top: 1,
        left: 0,
        right: 0,
        bottom: 0
    });

    self.initialized = true;

    self.emit('updated');
};

Screen.prototype.render = function render()
{
    this.screen.render();
};

Screen.prototype.deinit = function deinit()
{
    var self = this;

    if (self.initalized)
        self.screen.destroy();
};

module.exports = makeSingleton();
