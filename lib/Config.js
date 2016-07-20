var action, versions, command, concurrency, Package, setupCommand;


var args = require('minimist')(process.argv.slice(2));

try
{
    action = args._[0]
    if (action.length < 1)
    {
        throw 'err';
    }
}
catch (e)
{
    action = 'test'
}

try
{

    Package = require(process.cwd() + '/package.json');
}
catch (e)
{
    Package = {}
}


try
{
    versions = Package.config.ndt.versions;
    if (versions.length < 1)
    {
        throw 'err';
    }
} catch (e)
{
    versions = ['0.12', '4', '5', '6'];
}

try
{
    command = Package.config.ndt.command;
    if (command.length < 1)
    {
        throw 'err';
    }
} catch (e)
{
    command = "npm test";
}

try
{
    setupCommand = Package.config.ndt.setupCommand;
    if (setupCommand.length < 1)
    {
        throw 'err';
    }
} catch (e)
{
    setupCommand = "true";
}

try
{
    name = 'ndt:' + Package.name;
}
catch (e)
{
    name = 'ndt:generic';
}


if (args.hasOwnProperty('c'))
{
    concurrency = parseInt(args.c);
}
else
{
    concurrency = require('os').cpus().length - 1;
}

if (args.hasOwnProperty('v'))
{
    versions = args.v.split(',');
}

module.exports = {
    action: action,
    versions: versions,
    command: command,
    setupCommand: setupCommand,
    name: name,
    concurrency: concurrency
};
