var Docker = require('./Docker');
var Config = require('./Config');

var Commands = {};

module.exports = Commands;

Commands.setup = function (outputCallback)
{
    var installCommands, command;

    if (Array.isArray(Config.setupCommand))
    {
        command = Config.setupCommand.join(' && ');
    }
    else
    {
        command = Config.setupCommand;
    }

    installCommands = [];

    installCommands.push('echo "Starting"');
    installCommands.push('apt-get update');
    installCommands.push('apt-get install -y git rsync wget');
    installCommands.push('mkdir /testing');
    installCommands.push('wget https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh');
    installCommands.push('NVM_DIR=\'/nvm\' bash install.sh');
    installCommands.push('source /nvm/nvm.sh');
    for (var i in Config.versions) installCommands.push('nvm install ' + Config.versions[i]);
    installCommands.push(command);
    installCommands.push('echo "Done"');

    return Docker.makeNew('debian:stable', 'ndt:' + Config.name, installCommands.join(' && '), outputCallback);
};

Commands.test = function (version, output_callback)
{
    var commands, command;

    if (Array.isArray(Config.command))
    {
        command = Config.command.join(' && ');
    }
    else
    {
        command = Config.command;
    }

    commands = [];
    commands.push('source /nvm/nvm.sh');
    commands.push('nvm use ' + version);
    commands.push('rsync -aAXx --delete --exclude .git --exclude build --exclude node_modules /testing-src/ /testing/');
    commands.push('cd /testing');
    commands.push('npm install');
    commands.push(command);
    return Docker
        .runContainerWithCopy(Config.name, commands.join(' && '), output_callback);
};