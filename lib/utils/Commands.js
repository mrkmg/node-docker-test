var Commands = {};

module.exports = Commands;

Commands.setup = function (versions, inputSetupCommands)
{
    if (!Array.isArray(inputSetupCommands)) inputSetupCommands = [inputSetupCommands];

    var setupCommands = [
        'echo "Starting"',
        'apt-get update',
        'apt-get upgrade -y',
        'apt-get install -y git rsync wget',
        '(mkdir /test || true)',
        'wget https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -O install.sh',
        'NVM_DIR=\'/nvm\' bash install.sh',
        'source /nvm/nvm.sh'
    ];

    setupCommands = setupCommands
        .concat(versions.map(function (v)
        {
            return 'nvm install ' + v;
        }))
        .concat(inputSetupCommands);

    return setupCommands.join(' && ');
};

Commands.test = function (version, inputCommands)
{
    if (!Array.isArray(inputCommands)) inputCommands = [inputCommands];

    var commands = [
        'source /nvm/nvm.sh',
        'nvm install ' + version,
        'nvm use ' + version,
        'rsync -aAXx --delete --exclude .git --exclude node_modules /test-src/ /test/',
        'cd /test',
        'npm install'
    ];

    commands = commands.concat(inputCommands);

    return commands.join(' && ');
};
