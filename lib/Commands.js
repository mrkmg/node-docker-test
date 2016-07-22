var Docker = require('./Docker');
var Config = require('./Config');

var Commands = {};

module.exports = Commands;

Commands.setup = function (versions)
{
    var setupCommand;

    setupCommand = Array.isArray(Config.setupCommand) ? Config.setupCommand : [Config.setupCommand];

    return [
        'echo "Starting"',
        'apt-get update',
        'apt-get upgrade -y',
        'apt-get install -y git rsync wget',
        '(mkdir /testing || true)',
        'wget https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh',
        'NVM_DIR=\'/nvm\' bash install.sh',
        'source /nvm/nvm.sh'
    ].concat(versions.map(function (version)
    {
        return 'nvm install ' + version;
    })).concat(setupCommand).join(' && ');
};

Commands.test = function (version)
{
    var commands, command;

    command = Array.isArray(Config.command) ? Config.command : [Config.command];

    commands = [
        'source /nvm/nvm.sh',
        'nvm install ' + version,
        'nvm use ' + version,
        'rsync -aAXx --delete --exclude .git --exclude node_modules /testing-src/ /testing/',
        'cd /testing',
        'npm install'
    ];

    commands = commands.concat(command);

    return commands.join(' && ');
};
