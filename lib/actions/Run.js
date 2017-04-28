var Promise, RunCli, RunGui, VersionParser, TestRunner;

Promise = require('bluebird');
RunCli = require('../display/RunCli');
RunGui = require('../display/RunGui');
VersionParser = require('../utils/VersionParser');
TestRunner = require('../TestRunner');

module.exports = Run;

function Run(config)
{
    var runScreen = config.simple ? new RunCli(config.name) : new RunGui(config.name);
    var testRunner;

    return Promise
        .resolve(config.versions)
        .then(VersionParser)
        .then(function (versions)
        {
            var screenFinishedPromise;

            if (versions.length == 0)
            {
                return Promise.reject(new Error("No versions found."));
            }

            testRunner = new TestRunner({
                name: 'ndt:' + config.name,
                versions: versions,
                commands: config.commands,
                concurrency: config.concurrency
            });

            connectEvents(testRunner, runScreen);

            screenFinishedPromise = new Promise(function (resolve, reject)
            {
                runScreen.on('finished', resolve);
                runScreen.on('errored', reject);
            });

            runScreen.initialize(testRunner.concurrency, versions);

            return Promise.all([testRunner.start(), screenFinishedPromise]);
        })
        .catch(function (err)
        {
            if (testRunner) {
                testRunner.stop();
            }

            return runScreen.showError(err.message);
        })
        .then(function ()
        {
            runScreen.destroy();
        });
}


function connectEvents(runner, screen)
{
    runner.on('started', function ()
    {
        screen.started();
    });

    runner.on('finished', function (results)
    {
        screen.finished(results);
    });

    runner.on('testStarted', function (test)
    {
        screen.testStarted(test);
    });

    runner.on('testData', function (data)
    {
        screen.testData(data);
    });

    runner.on('testFinished', function (test)
    {
        screen.testFinished(test);
    });

    runner.on('runnerStarted', function (runner)
    {
        screen.runnerStarted(runner);
    });

    runner.on('runnerFinished', function (runner)
    {
        screen.runnerFinished(runner);
    });
}
