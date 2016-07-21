var Config, Promise, Blessed, Commands, Docker;

Promise = require('bluebird');
Blessed = require('blessed');

Commands = require('../Commands');
Config = require('../Config');
Docker = require('../Docker');

module.exports = Setup;

function Setup(screen, render)
{
    var outputBox;
    return Promise.try(function ()
    {
        outputBox = Blessed.box({
            parent: screen,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            scrollable: true,
            scrollbar: {
                ch: ' ',
                style: {
                    bg: 'white'
                }
            }
        });

        return render();
    }).then(function ()
    {
        return Docker.makeNew('debian:stable', 'ndt:' + Config.name, Commands.setup(), function (data)
        {
            outputBox.content += data.toString();
            outputBox.scroll(20);
            render();
        });
    }).then(function ()
    {
        outputBox.content += "\n\n\nAll done!, press Enter to quit\n";

        screen.screen.key(['enter'], function ()
        {
            return process.exit(0);
        });
    });
}