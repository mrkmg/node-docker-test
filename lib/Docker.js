var Promise = require('bluebird');

var Spawn = require('child_process').spawn;

var Docker = {};

module.exports = Docker;

Docker.containerExists = function containerExists(name)
{
    var proc = Spawn('docker', ['inspect', name]);

    return new Promise(function (resolve)
    {
        proc.on('close', function (result_code)
        {
            result_code === 0 ? resolve(true) : resolve(false);
        });
    });
};

Docker.getLastContainerSha = function getLastContainerSha()
{
    var proc = Spawn('docker', ['ps', '-l', '-q']);
    var data = '';
    proc.stdout.on('data', function (d)
    {
        data += d.toString().trim();
    });

    return new Promise(function (resolve, reject)
    {
        proc.on('close', function (result_code)
        {
            result_code === 0 ? resolve(data) : reject("Failed to get last SHA");
        });
    });
};

Docker.removeContainer = function removeContainer(name)
{
    var proc = Spawn('docker', ['rmi', '--force', name]);

    return new Promise(function (resolve, reject)
    {
        proc.on('close', function (result_code)
        {
            result_code === 0 ? resolve() : reject("Failed to remove container");
        });
    });
};

Docker.runContainer = function runContainer(name, cmd, outputCallback)
{
    var args = ['run', '-i', name, '/bin/bash', '-c', cmd];
    var proc = Spawn('docker', args);
    var running = true;

    proc.stdout.on('data', outputCallback);
    proc.stderr.on('data', outputCallback);

    process.on('exit', function ()
    {
        if (running) proc.kill('SIGKILL');
    });

    return new Promise(function (resolve, reject)
    {
        proc.on('close', function (result_code)
        {
            running = false;
            result_code === 0 ? resolve() : reject("Failed to run container");
        });
    });
};

Docker.runContainerWithCopy = function runContainerWithCopy(name, cmd, outputCallback)
{
    var args = ['run', '-i', '--rm', '-v', process.cwd() + ':/testing-src/:ro', name, '/bin/bash', '-c', cmd];
    var proc = Spawn('docker', args);
    var running = true;

    process.on('exit', function ()
    {
        if (running) proc.kill('SIGKILL');
    });

    proc.stdout.on('data', outputCallback);
    proc.stderr.on('data', outputCallback);

    return new Promise(function (resolve, reject)
    {
        proc.on('close', function (result_code)
        {
            running = false;
            result_code === 0 ? resolve() : reject("Failed to run container");
        });
    });
};

Docker.commitContainer = function commitContainer(sha, name)
{

    var proc = Spawn('docker', ['commit', sha, name]);

    return new Promise(function (resolve, reject)
    {
        proc.on('close', function (result_code)
        {
            result_code === 0 ? resolve() : reject("Failed to commit container");
        });
    });
};

Docker.makeNew = function makeNew(base, name, cmd, outputCallback)
{
    return Promise.try(function ()
    {
        outputCallback('Checking if ' + name + " exists.\n");
        return Docker.containerExists(name);
    }).then(function (exists)
    {
        outputCallback('Removing ' + name + ".\n");
        if (exists) return Docker.removeContainer(name)
    }).then(function ()
    {
        outputCallback('Setting Up ' + name + "\n");
        return Docker.runContainer(base, cmd, outputCallback);
    }).then(function ()
    {
        return new Promise(function (resolve)
        {
            setTimeout(resolve, 2000);
        });
    }).then(function ()
    {
        return Docker.getLastContainerSha();
    }).then(function (sha)
    {
        outputCallback('Committing ' + name + "\n");
        return Docker.commitContainer(sha, name);
    });
};