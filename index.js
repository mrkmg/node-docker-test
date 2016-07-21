var Docker, Promise, Commands, Blessed, Config, screen, Run, title;

Promise = require('bluebird');
Blessed = require('blessed');

Docker = require('./lib/Docker');
Commands = require('./lib/Commands');
Config = require('./lib/Config');

Run = require('./lib/actions/Run');
Setup = require('./lib/actions/Setup');

title = 'Node Docker Test - ' + Config.name;

screen = Blessed.screen({
    smartCSR: true
});

screen.key(['escape', 'C-c'], function ()
{
    screen.destroy();
    return process.exit(1);
});

screen.title = title;

Promise.try(function ()
{
    return main();
}).then(function ()
{
    screen.destroy();
    process.exit(0);
}).catch(function (e)
{
    screen.destroy();
    console.error(e);
    process.exit(1);
});

function main()
{
    var titleTextBox, bodyBox;

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
            return Setup(bodyBox, render);
            break;
        case 'test':
            return Run(bodyBox, render);
            break;
        default:
            throw new Error(Config.action + ' is an unknown action')
    }
}

function render()
{
    return screen.render();
}