var Config, Promise, Blessed, Commands;

Promise = require('bluebird');
Blessed = require('blessed');

Commands = require('./Commands');
Config = require('./Config');

module.exports = Setup;

function Setup(screen, render)
{
    var outputBox;
    Promise.try(function ()
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

        render();
    }).then(function ()
    {
        return Commands.setup(function ()
        {
            outputBox.content += data.toString();
            outputBox.setScrollPerc(100);
            render();

        }).then(function ()
        {
            outputBox.content += "\n\n\nAll done!, press Enter to quit\n";

            screen.screen.key(['enter'], function ()
            {
                return process.exit(0);
            });
        });
    });
}