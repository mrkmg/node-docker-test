var Promise, SetupRunner;

Promise = require('bluebird');

SetupRunner = require('../SetupRunner');

module.exports = Setup;

function Setup(config)
{
    var setup = new SetupRunner({
        name: 'ndt:' + config.name,
        baseImage: config['base-image'],
        versions: config.versions,
        commands: config['setup-commands'],
        reset: config.reset
    });

    setup.on('data', function (data)
    {
        process.stdout.write(data);
    });

    return setup.start();
}
