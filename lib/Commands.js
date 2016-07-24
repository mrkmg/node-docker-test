var Docker = require('./Docker');
var Config = require('./Config');

var Commands = {};

module.exports = Commands;

Commands.setup = function (versions)
{
    var setupCommands;

    setupCommands = Array.isArray(Config['setup-commands']) ? Config['setup-commands'] : [Config['setup-commands']];

    return [
        'echo "Starting"',
        'apt-get update',
        'apt-get upgrade -y',
        'apt-get install -y git rsync wget',
        '(mkdir /test || true)',
        'wget https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -O install.sh',
        'NVM_DIR=\'/nvm\' bash install.sh',
        'source /nvm/nvm.sh'
    ].concat(versions.map(function (version)
    {
        return 'nvm install ' + version;
    })).concat(setupCommands).join(' && ');
};

Commands.test = function (version)
{
    var commands, command;

    command = Array.isArray(Config.commands) ? Config.commands : [Config.commands];

    commands = [
        'source /nvm/nvm.sh',
        'nvm install ' + version,
        'nvm use ' + version,
        'rsync -aAXx --delete --exclude .git --exclude node_modules /test-src/ /test/',
        'cd /test',
        'npm install'
    ];

    commands = commands.concat(command);

    return commands.join(' && ');
};
