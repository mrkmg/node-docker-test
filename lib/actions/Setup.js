var Promise, Blessed, Commands, Docker, VersionKeywords;

Promise = require('bluebird');
Blessed = require('blessed');

Commands = require('../utils/Commands');
Docker = require('../utils/Docker');
VersionKeywords = require('../utils/VersionKeywords');

module.exports = Setup;

function Setup(config)
{
    return Promise
        .try(function ()
        {
            return Docker.containerExists('ndt:' + config.name);
        })
        .then (function (exists)
        {
            return exists && config.reset ? Docker.removeContainer('ndt:' + config.name) : null;
        })
        .then(function ()
        {
            return VersionKeywords(config.versions);
        })
        .then(function (versions)
        {
            return Docker.makeNew('ndt:' + config.name, Commands.setup(versions, config), config['base-image'], function (data)
            {
                process.stdout.write(data.toString());
            });
        });
}
