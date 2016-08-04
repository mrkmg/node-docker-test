var Promise = require('bluebird');

var ChildProcess = require('child_process');

var Docker = {};

module.exports = Docker;

Docker.containerExists = function containerExists(name)
{
    var dockerProcess = ChildProcess.spawn('docker', ['inspect', name]);

    return new Promise(function (resolve)
    {
        dockerProcess.on('close', function (result_code)
        {
            result_code === 0 ? resolve(true) : resolve(false);
        });
    });
};

Docker.getLastContainerSha = function getLastContainerSha()
{
    var dockerProcess = ChildProcess.spawn('docker', ['ps', '-l', '-q']);
    var data = '';
    dockerProcess.stdout.on('data', function (d)
    {
        data += d.toString().trim();
    });

    return new Promise(function (resolve, reject)
    {
        dockerProcess.on('close', function (result_code)
        {
            result_code === 0 ? resolve(data) : reject(new Error("Failed to get last SHA"));
        });
    });
};

Docker.removeContainer = function removeContainer(name)
{
    var dockerProcess = ChildProcess.spawn('docker', ['rmi', '--force', name]);

    return new Promise(function (resolve, reject)
    {
        dockerProcess.on('close', function (result_code)
        {
            result_code === 0 ? resolve() : reject(new Error("Failed to remove container"));
        });
    });
};

Docker.runContainer = function runContainer(name, cmd, outputCallback)
{
    var args = ['run', '-i', name, '/bin/bash', '-c', cmd];
    var dockerProcess = ChildProcess.spawn('docker', args);
    var running = true;

    dockerProcess.stdout.on('data', outputCallback);
    dockerProcess.stderr.on('data', outputCallback);

    process.on('exit', function ()
    {
        if (running)
        {
            //noinspection JSCheckFunctionSignatures
            dockerProcess.kill('SIGKILL');
        }
    });

    return new Promise(function (resolve, reject)
    {
        dockerProcess.on('close', function (result_code)
        {
            running = false;
            result_code === 0 ? resolve() : reject(new Error("Failed to run container"));
        });
    });
};

Docker.runContainerWithCopy = function runContainerWithCopy(name, cmd, outputCallback)
{
    var args = ['run', '-i', '--rm', '-v', process.cwd() + ':/test-src/:ro', name, '/bin/bash', '-c', cmd];
    var dockerProcess = ChildProcess.spawn('docker', args);
    var running = true;

    process.on('exit', function ()
    {
        if (running)
        {
            //noinspection JSCheckFunctionSignatures
            dockerProcess.kill('SIGKILL');
        }
    });

    dockerProcess.stdout.on('data', outputCallback);
    dockerProcess.stderr.on('data', outputCallback);

    return new Promise(function (resolve, reject)
    {
        dockerProcess.on('close', function (result_code)
        {
            running = false;
            result_code === 0 ? resolve() : reject(new Error("Failed to run container"));
        });
    });
};

Docker.commitContainer = function commitContainer(sha, name)
{

    var dockerProcess = ChildProcess.spawn('docker', ['commit', sha, name]);

    return new Promise(function (resolve, reject)
    {
        dockerProcess.on('close', function (result_code)
        {
            result_code === 0 ? resolve() : reject("Failed to commit container");
        });
    });
};

Docker.makeNew = function makeNew(name, cmd, baseImage, outputCallback)
{
    return Promise.try(function ()
    {
        return Docker.containerExists(name);
    }).then(function (exists)
    {
        return exists ? name : baseImage;
    }).then(function (base)
    {
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
        outputCallback("\n\nCompleted Setup.\nSaving Container. Please Wait");
        return Docker.commitContainer(sha, name);
    });
};
