/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <https://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
var Promise = require('bluebird');
var ndt     = require('./api.js');

var setupRunner, testRunner;

Promise
    .try(function () {
        return ndt.VersionParser(['6', 'minor | eq:5']);
    })
    .then(function (versions) {
        setupRunner = new ndt.SetupRunner({
            name: 'custom:runner',
            'base-image': 'debian:latest',
            versions: versions,
            commands: [],
            reset: false
        });

        testRunner = new ndt.TestRunner({
            name: 'custom:runner',
            versions: versions,
            commands: ['sleep 5', 'echo "Test Running!"', 'sleep 5', 'echo "Test Done"'],
            concurrency: 2
        });

        setupRunner.on('data', function (data) {
            console.log(data);
        });

        testRunner.on('started', function () {
            console.log('started');
        });

        testRunner.on('finished', function (results) {
            console.log('finished', results);
        });

        testRunner.on('testStarted', function (test) {
            console.log('testStarted', test);
        });

        testRunner.on('testData', function (test) {
            console.log('testData', test);
        });

        testRunner.on('testFinished', function (test) {
            console.log('testFinished', test);
        });

        testRunner.on('runnerStarted', function (runner) {
            console.log('runnerStarted', runner);
        });

        testRunner.on('runnerFinished', function (runner) {
            console.log('runnerFinished', runner);
        });
    })
    // .then(function () {
    //     return setupRunner.start();
    // })
    .then(function () {
        setTimeout(function () {
            testRunner.stop();
        }, 1000);
        return testRunner.start();
    })
    .then(function (results) {
        //results are here as well
    });
