var Docker = require('./Docker');
var Config = require('./Config');

var Commands = {};

module.exports = Commands;

Commands.setup = function (output_callback)
{
    var install_cmds, command;

    if (Array.isArray(Config.setupCommand))
    {
        command = Config.setupCommand.join(' && ');
    }
    else
    {
        command = Config.setupCommand;
    }

    install_cmds = [];

    install_cmds.push('echo "Starting"');
    install_cmds.push('apt-get update');
    install_cmds.push('apt-get install -y git rsync wget');
    install_cmds.push('mkdir /testing');
    install_cmds.push('wget https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh');
    install_cmds.push('NVM_DIR=\'/nvm\' bash install.sh');
    install_cmds.push('source /nvm/nvm.sh');
    for (var i in Config.versions) install_cmds.push('nvm install ' + Config.versions[i]);
    install_cmds.push(command);
    install_cmds.push('echo "Done"');

    return Docker.makeNew('debian:stable', Config.name, install_cmds.join(' && '), output_callback);
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