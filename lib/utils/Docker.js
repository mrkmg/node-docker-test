var Promise      = require('bluebird');
var ChildProcess = require('child_process');

var Docker = {};

module.exports = Docker;

Docker.containerExists = function containerExists(name) {
    var dockerProcess = ChildProcess.spawn('docker', ['inspect', name]);

    var promise = new Promise(function (resolve) {
        dockerProcess.on('close', function (result_code) {
            result_code === 0 ? resolve(true) : resolve(false);
        });
    });

    promise.process = dockerProcess;
    return promise;
};

Docker.getLastContainerSha = function getLastContainerSha() {
    var dockerProcess = ChildProcess.spawn('docker', ['ps', '-l', '-q']);
    var data          = '';
    dockerProcess.stdout.on('data', function (d) {
        data += d.toString().trim();
    });

    var promise = new Promise(function (resolve, reject) {
        dockerProcess.on('close', function (result_code) {
            result_code === 0 ? resolve(data) : reject(new Error("Failed to get last SHA"));
        });
    });

    promise.process = dockerProcess;
    return promise;
};

Docker.removeContainer = function removeContainer(name) {
    var dockerProcess = ChildProcess.spawn('docker', ['rmi', '--force', name]);

    var promise = new Promise(function (resolve, reject) {
        dockerProcess.on('close', function (result_code) {
            result_code === 0 ? resolve() : reject(new Error("Failed to remove container"));
        });
    });

    promise.process = dockerProcess;
    return promise;
};

Docker.runContainer = function runContainer(name, cmd, outputCallback) {
    var args          = ['run', '-i', name, '/bin/bash', '-c', cmd];
    var dockerProcess = ChildProcess.spawn('docker', args);
    var kill;

    dockerProcess.stdout.on('data', outputCallback);
    dockerProcess.stderr.on('data', outputCallback);

    process.on('exit', kill = function () {
        dockerProcess.kill('SIGKILL');
    });

    var promise = new Promise(function (resolve, reject) {
        dockerProcess.on('close', function (result_code) {
            process.removeListener('exit', kill);
            result_code === 0 ? resolve() : reject(new Error("Failed to run container"));
        });
    });

    promise.process = dockerProcess;
    return promise;
};

Docker.runContainerWithCopy = function runContainerWithCopy(name, cmd, outputCallback) {
    var args          = ['run', '-i', '--rm', '-v', process.cwd() + ':/test-src/:ro', name, '/bin/bash', '-c', cmd];
    var dockerProcess = ChildProcess.spawn('docker', args);
    var kill;

    dockerProcess.stdout.on('data', outputCallback);
    dockerProcess.stderr.on('data', outputCallback);

    process.on('exit', kill = function () {
        dockerProcess.kill('SIGKILL');
    });

    var promise = new Promise(function (resolve, reject) {
        dockerProcess.on('close', function (result_code) {
            process.removeListener('exit', kill);
            result_code === 0 ? resolve() : reject(new Error("Failed to run container"));
        });
    });

    promise.process = dockerProcess;
    return promise;
};

Docker.commitContainer = function commitContainer(sha, name) {

    var dockerProcess = ChildProcess.spawn('docker', ['commit', sha, name]);

    var promise = new Promise(function (resolve, reject) {
        dockerProcess.on('close', function (result_code) {
            result_code === 0 ? resolve() : reject("Failed to commit container");
        });
    });

    promise.process = dockerProcess;
    return promise;
};

Docker.makeNew = function makeNew(name, cmd, baseImage, outputCallback) {
    return Promise.try(function () {
        return Docker.containerExists(name);
    }).then(function (exists) {
        return exists ? name : baseImage;
    }).then(function (base) {
        return Docker.runContainer(base, cmd, outputCallback);
    }).then(function () {
        return Docker._wait();
    }).then(function () {
        return Docker.getLastContainerSha();
    }).then(function (sha) {
        outputCallback("\n\nCompleted Setup.\nSaving Container. Please Wait");
        return Docker.commitContainer(sha, name);
    });
};

Docker._wait = function () {
    return new Promise(function (resolve) {
        setTimeout(resolve, 2000);
    });
};
