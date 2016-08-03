var Promise, Config, Run, Setup;

Promise = require('bluebird');

Config = require('./lib/utils/Config').parse();

Run = require('./lib/actions/Run');
Setup = require('./lib/actions/Setup');

return Promise
    .try(function ()
    {
        if (Config.setup)
        {
            return Setup(Config);
        }
        else
        {
            return Run(Config);
        }
    })
    .then(function ()
    {
        process.exit(0);
    })
    .catch(function (e)
    {
        if (process.env.DEBUG)
        {
            console.error(e);
        }
        else
        {
            console.error(e.message);
        }
        process.exit(255);
    });





