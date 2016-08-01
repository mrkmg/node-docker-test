var Docker, Promise, Commands, Config, Screen, Run, Setup, screen;

Promise = require('bluebird');

Screen = require('./lib/display/Screen');
Docker = require('./lib/Docker');
Commands = require('./lib/Commands');
Config = require('./lib/Config');

Run = require('./lib/actions/Run');
Setup = require('./lib/actions/Setup');

return Promise
    .try(function ()
    {
        screen = new Screen();


        if (Config.setup)
        {
            return Setup(Config);
        }

        if (!Config.simple)
        {
            screen.intialize(Config.name);
            screen.on('userKill', function ()
            {
                screen.deinit();
                process.exit(255);
            });
        }

        return Run(Config, screen);
    }).then(function ()
    {
        screen.deinit();

        process.exit(0);
    }).catch(function (e)
    {
        screen.deinit();
        console.error(e);
        process.exit(255);
    });
