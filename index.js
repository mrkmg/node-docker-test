var Docker, Promise, Commands, Blessed, Config, screen, Run, title, titleTextBox, bodyBox;

Promise = require('bluebird');
Blessed = require('blessed');

Docker = require('./lib/Docker');
Commands = require('./lib/Commands');
Config = require('./lib/Config');

Run = require('./lib/actions/Run');
Setup = require('./lib/actions/Setup');

title = 'Node Docker Test - ' + Config.name;

Promise.try(function ()
{
    return main();
}).then(function ()
{
    if (screen) screen.destroy();
    process.exit(0);
}).catch(function (e)
{
    if (screen) screen.destroy();
    console.error(e);
    process.exit(1);
});

function main()
{
    switch (Config.action)
    {
        case 'setup':
            return Setup();
            break;
        case 'test':
            initializeScreen();
            return Run(bodyBox, render);
            break;
        default:
            throw new Error(Config.action + ' is an unknown action')
    }
}

function initializeScreen()
{
    screen = Blessed.screen({
        smartCSR: true
    });

    screen.key(['escape', 'C-c'], function ()
    {
        screen.destroy();
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
}

function render()
{
    return screen.render();
}