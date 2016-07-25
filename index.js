var Docker, Promise, Commands, Config, screen, Run, title;

Promise = require('bluebird');

Screen = require('./lib/display/Screen');
Docker = require('./lib/Docker');
Commands = require('./lib/Commands');
Config = require('./lib/Config');

Run = require('./lib/actions/Run');
Setup = require('./lib/actions/Setup');


Promise.try(function ()
{
    return main();
}).then(function ()
{
    Screen.deinit();
    process.exit(0);
}).catch(function (e)
{
    Screen.deinit();
    console.error(e);
    process.exit(255);
});

function main()
{
    if (Config.setup)
    {
        return Setup();
    }

    if (!Config.simple)
    {
        Screen.intialize();
        Screen.on('userKill', function ()
        {
            Screen.deinit();
            process.exit(255);
        })
    }

    return Run();
}
