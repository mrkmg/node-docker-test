var Promise, SetupRunner, VersionParser;

Promise = require('bluebird');

SetupRunner = require('../SetupRunner');
VersionParser = require('../utils/VersionParser');

module.exports = Setup;

function Setup(config)
{
    return Promise
        .try(function ()
        {
            return VersionParser(config.versions)
        })
        .then(function (versions)
        {
            var setup = new SetupRunner({
                name: 'ndt:' + config.name,
                baseImage: config['base-image'],
                versions: versions,
                commands: config['setup-commands'],
                reset: config.reset,
                packageManager: config['package-manager']
            });

            setup.on('data', function (data)
            {
                process.stdout.write(data);
            });

            return setup.start();
        });
}
