var Promise, Config, Run, Setup;

Promise = require('bluebird');

Config = require('./lib/utils/Config');

Run = require('./lib/actions/Run');
Setup = require('./lib/actions/Setup');

return Promise
    .try(function ()
    {
        var config = Config.parse();

        if (config.setup)
        {
            return Setup(config);
        }
        else
        {
            return Run(config);
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





