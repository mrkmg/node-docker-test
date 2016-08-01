var Pad, Docker, Promise, VersionKeywords, RunScreen, Test;

Pad = require('pad');
Promise = require('bluebird');
Docker = require('../Docker');
VersionKeywords = require('../VersionKeywords');
RunScreen = require('../display/RunScreen');
Test = require('../Test');

module.exports = Run;

function Run(config, screen)
{
    var runScreen, versions, numberRunners, tests;

    return Promise
        .try(function ()
        {
            return Docker.containerExists('ndt:' + config.name);
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
            return VersionKeywords(config.versions);
        })
        .then(function (v)
        {
            versions = v;
            numberRunners = Math.min(versions.length, config.concurrency);

            if (!config.simple)
            {
                runScreen = new RunScreen(screen, {}, numberRunners, versions);
            }
        })
        .then(function ()
        {
            return versions.map(function (version)
            {
                return new Test(version, config);
            });
        })
        .then(function (t)
        {
            tests = t;

            if (config.simple)
            {
                return runTests(tests, numberRunners, function (i, version)
                    {
                        console.log('Test Runner ' + i + ': Started v' + version);
                    }, function ()
                    {
                    },
                    function (i, version, result)
                    {
                        console.log('Test Runner ' + i + ': Finished v' + version + ' ' + (result ? 'Passed' : 'Failed'));
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
            if (config.simple)
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
