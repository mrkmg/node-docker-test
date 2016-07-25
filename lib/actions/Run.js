var Pad, Config, Docker, Promise, VersionKeywords, Screen, RunScreen, Test;

Pad = require('pad');
Promise = require('bluebird');
Config = require('../Config');
Docker = require('../Docker');
VersionKeywords = require('../VersionKeywords');
Screen = require('../display/Screen');
RunScreen = require('../display/RunScreen');
Test = require('../Test');

module.exports = Run;

function Run()
{
    var runScreen, versions, numberRunners, tests;

    return Promise
        .try(function ()
        {
            return Docker.containerExists('ndt:' + Config.name);
        })
        .then(function (exists)
        {
            if (!exists)
            {
                throw new Error("Please run setup first.");
            }
        })
        .then(function ()
        {
            return VersionKeywords(Config.versions);
        })
        .then(function (v)
        {
            versions = v;
            numberRunners = Math.min(versions.length, Config.concurrency);

            if (!Config.simple)
            {
                runScreen = new RunScreen(Screen, {}, numberRunners, versions);
            }
        })
        .then(function ()
        {
            return versions.map(function (version)
            {
                return new Test(version);
            });
        })
        .then(function (t)
        {
            tests = t;

            if (Config.simple)
            {
                return runTests(tests, numberRunners, function (i, version)
                    {
                        console.log('Test Runner ' + i + ': Started v' + version);
                    }, function ()
                    {
                    },
                    function (i, version, result)
                    {
                        console.log('Test Runner ' + i + ': Finished v' + version + ' ' + (result.passed ? 'Passed' : 'Failed'));
                    });
            }

            return runTests(tests, numberRunners, function (i, version)
            {
                runScreen.startTest(i, version);
            }, function (i, data)
            {
                runScreen.writeTest(i, data);
            }, function (i, version, result)
            {
                runScreen.finishTest(i, version, result);
            });


        })
        .then(function (results)
        {
            if (Config.simple)
            {
                var passed = [];
                var failed = [];

                results.forEach(function (result)
                {
                    result.passed ? passed.push(result) : failed.push(result);
                });

                console.log('All tests finished.');
                console.log('Passed Tests: ' + passed.length);
                console.log('Failed Tests: ' + failed.length);
                console.log('');

                if (failed.length)
                {
                    console.log('Failed Versions: ' + failed.map(function (result)
                        {
                            return 'v' + result.version;
                        }).join(', '));

                    process.exit(failed.length);
                }


                return true;
            }

            runScreen.on('versionClick', function (version)
            {
                var test = tests.filter(function (t)
                {
                    return t.version == version;
                })[0];

                runScreen.reviewResult(version, test.result);
            });

            return runScreen.showResults(results);
        });
}

function runTests(tests, num_runners, setupCallback, dataCallback, finishCallback)
{
    var i = -1;

    return Promise
        .try(function ()
        {
            var results = [];
            var testRunners = [];

            var next = function (test_id)
            {
                if (++i < tests.length)
                {
                    var test = tests[i];
                    return Promise
                        .try(function ()
                        {
                            tests[i].on('data', function (data)
                            {
                                dataCallback(test_id, data);
                            });
                            setupCallback(test_id, test.version);
                            return tests[i].run();
                        })
                        .then(function (result)
                        {
                            finishCallback(test_id, test.version, result.passed);
                            test.removeAllListeners('data');
                            results.push(result)
                        })
                        .then(function ()
                        {
                            return next(test_id);
                        });
                }
                else
                {
                    dataCallback(test_id, "Test Runner Finished");
                    return true;
                }
            };

            for (var test_id = 0; test_id < num_runners; test_id++)
            {
                testRunners.push(next(test_id));
            }

            return Promise.all(testRunners).then(function ()
            {
                return results;
            });
        });
}
