/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <https://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
var Commands = {};

module.exports = Commands;

Commands.setup = function (versions, inputSetupCommands, packageManager, yarn) {
    if (!Array.isArray(inputSetupCommands)) {
        inputSetupCommands = [inputSetupCommands];
    }

    var setupCommands = ['echo "Starting"'];

    switch (packageManager) {
        case 'apt-get':
            setupCommands = setupCommands.concat([
                'apt-get update',
                'apt-get upgrade -y',
                'apt-get install -y git rsync wget'
            ]);
            break;
        case 'yum':
            setupCommands = setupCommands.concat([
                'yum update -y',
                'yum clean all',
                'yum install -y git rsync wget'
            ]);
            break;
        default:
            throw new Error("Invalid Package Manager Found: " + packageManager);
    }

    setupCommands = setupCommands.concat([
        '(mkdir /test || true)',
        'wget https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh -O install.sh',
        'NVM_DIR=\'/nvm\' bash install.sh',
        'source /nvm/nvm.sh'
    ]);

    setupCommands = setupCommands
        .concat(versions.map(function (v) {
            if (yarn) {
                return 'nvm install ' + v + ' && npm install -g yarn';
            }
            return 'nvm install ' + v;
        }))
        .concat(inputSetupCommands);

    return setupCommands.join(' && ');
};

Commands.test = function (version, inputCommands, yarn) {
    if (!Array.isArray(inputCommands)) {
        inputCommands = [inputCommands];
    }

    var commands = [
        'source /nvm/nvm.sh',
        'nvm install ' + version,
        'nvm use ' + version,
        'rsync -aAXx --delete --exclude .git --exclude node_modules /test-src/ /test/',
        'cd /test'
    ];

    if (yarn) commands.push('yarn');
    else commands.push('npm install');

    commands = commands.concat(inputCommands);

    return commands.join(' && ');
};
