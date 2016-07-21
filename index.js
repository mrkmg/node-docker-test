var Docker, Promise, Commands, Blessed, Config, screen, titleTextBox, bodyBox, Run;

Promise = require('bluebird');
Blessed = require('blessed');

Docker = require('./lib/Docker');
Commands = require('./lib/Commands');
Config = require('./lib/Config');
Run = require('./lib/Run');

main();

function main()
{
    var title = 'Node Docker Test - ' + Config.name;

    screen = Blessed.screen({
        smartCSR: true
    });

    screen.key(['escape', 'C-c'], function ()
    {
        return process.exit(1);
    });

    screen.title = title;

    titleTextBox = Blessed.text({
        top: 0,
        left: 'center',
        width: title.length,
        height: 1,
        content: title
    });

    bodyBox = Blessed.box({
        top: 1,
        left: 0,
        right: 0,
        bottom: 0
    });

    screen.append(titleTextBox);
    screen.append(bodyBox);
    screen.render();

    switch (Config.action)
    {
        case 'setup':
            setup();
            break;
        case 'test':
            Run(bodyBox, function () { screen.render(); }).catch(function(e)
            {
                screen.destroy();
                console.error(e.message);
                process.exit(1);
            }).then(function ()
            {
                screen.destroy();
                process.exit(0);
            });
            break;
        default:
            screen.destroy();
            console.error(Config.action + ' is an unknown action');
    }
}

function setup()
{
    var outputCallback, outputBox;

    outputCallback = function (data)
    {
        outputBox.content += data.toString();
        outputBox.setScrollPerc(100);
        screen.render();
    };

    outputBox = Blessed.box({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        scrollable: true
    });

    outputBox.focus();

    bodyBox.append(outputBox);
    screen.render();

    Commands.setup(outputCallback).then(function ()
    {
        outputCallback("All done!, press Enter or ESC to quit\n");

        screen.key(['enter'], function ()
        {
            return process.exit(0);
        });
    }).catch(function (e)
    {
        outputCallback(e);
    });
}
