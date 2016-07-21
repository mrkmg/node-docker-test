var Docker = require('./Docker');
var Config = require('./Config');

var Commands = {};

module.exports = Commands;

Commands.setup = function ()
{
    var setupCommands, setupCommand;

    setupCommand = Array.isArray(Config.setupCommand) ? Config.setupCommand : [Config.setupCommand];

    setupCommands = [
        'echo "Starting"',
        'apt-get update',
        'apt-get install -y git rsync wget',
        'mkdir /testing',
        'wget https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh',
        'NVM_DIR=\'/nvm\' bash install.sh',
        'source /nvm/nvm.sh'
    ];

    for (var i in Config.versions) setupCommands.push('nvm install ' + Config.versions[i]);

    setupCommands.concat(setupCommand);

    return setupCommands.join(' && ');
};

Commands.test = function (version)
{
    var commands, command;

    command = Array.isArray(Config.command) ? Config.command : [Config.command];

    commands = [
        'source /nvm/nvm.sh',
        'nvm use ' + version,
        'rsync -aAXx --delete --exclude .git --exclude node_modules /testing-src/ /testing/',
        'cd /testing',
        'npm install'
    ];

    commands.concat(command);

    return commands.join(' && ');
};