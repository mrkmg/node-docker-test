var Pad, Blessed, Commands, Config, Docker, Promise, VersionKeywords;

Pad = require('pad');
Promise = require('bluebird');
Blessed = require('blessed');
Commands = require('../Commands');
Config = require('../Config');
Docker = require('../Docker');
VersionKeywords = require('../VersionKeywords');

module.exports = Run;

function Run(screen, render)
{
    var testScreen, versions, setupTests;

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
            testScreen = setupScreen(screen, Math.min(versions.length, Config.concurrency));
            return versions;
        })
        .tap(render)
        .map(function (version, i)
        {
            return setupTest(i, version, testScreen.results);
        })
        .tap(render)
        .then(function (tests)
        {
            setupTests = tests;
            return runTests(tests, testScreen.tests, render);
        })
        .tap(function ()
        {
            testScreen.tests.forEach(function (testBox)
            {
                testBox.hide();
            });

            testScreen.single.show();
            testScreen.single.reset();
            testScreen.single.appendContent("Select a test to the right");

            setupTests.forEach(function (test)
            {
                test._row.on('click', function ()
                {
                    testScreen.single.reset();
                    testScreen.single.setTitle('v' + test.version);
                    testScreen.single.appendContent(test.content);
                    render();
                });
            });

            render();
        })
        .then(function (results)
        {
            return showResult(screen, render, results);
        });
}

function runTests(tests, testBoxes, render)
{
    var i = -1;

    return Promise
        .resolve(testBoxes)
        .map(function (testBox)
        {
            var runnerResults = [];

            var next = function ()
            {
                if (++i < tests.length)
                {
                    return Promise
                        .try(function ()
                        {
                            return runTest(tests[i], testBox, render);
                        })
                        .then(function (result)
                        {
                            runnerResults.push(result);
                        })
                        .then(next);
                }
                else
                {
                    return runnerResults;
                }
            };

            return next();
        })
        .then(flattenArrays);
}

function runTest(test, testBox, render)
{
    return Promise
        .try(function ()
        {
            testBox.setTitle('v' + test.version);
            test.setStatus('Running');
            test.setColor('yellow');
            render();
        })
        .then(function ()
        {
            return test.run(testBox.appendContent, render);
        })
        .tap(function (result)
        {
            testBox.reset();
            if (result.passed)
            {
                test.setStatus('Passed');
                test.setColor('green');
            }
            else
            {
                test.setStatus('Failed');
                test.setColor('red');
            }
            render()
        });
}

function setupTest(top, version, resultList)
{
    var test = {};

    test.version = version;

    test._row = Blessed.box({
        parent: resultList,
        top: top,
        height: 1,
        width: '100%',
        mouse: true,
        style: {
            bg: 'white',
            fg: 'black'
        }
    });

    test._name = Blessed.text({
        parent: test._row,
        left: 0,
        content: 'v' + version,
        style: {
            bg: 'white',
            fg: 'black'
        }
    });

    test._status = Blessed.text({
        parent: test._row,
        right: 0,
        content: 'Pending',
        style: {
            bg: 'white',
            fg: 'black'
        }
    });

    test.setStatus = function (status)
    {
        test._status.setContent(status);
    };

    test.setColor = function (color)
    {
        test._row.style.bg = color;
        test._name.style.bg = color;
        test._status.style.bg = color;
    };

    test.content = '';

    test.run = function (outputCallback, render)
    {
        return Promise
            .try(function ()
            {
                return Docker.runContainerWithCopy('ndt:' + Config.name, Commands.test(version), function (r)
                {
                    test.content += r.toString();
                    outputCallback(r);
                    render();
                });
            })
            .then(function ()
            {
                return {
                    version: version,
                    passed: true
                };
            })
            .catch(function ()
            {
                return {
                    version: version,
                    passed: false
                };
            });
    };

    return test;
}

function setupScreen(screen, tests)
{
    var ScreenObjects = {}, percentage;

    percentage = Math.floor(100 / tests);

    ScreenObjects.results = Blessed.box({
        parent: screen,
        width: 19,
        height: '100%',
        right: 0,
        top: 0,
        scrollable: true,
        content: 'b',
        style: {
            bg: 'black',
            fg: 'white',
            border: {
                bg: 'white'
            }
        }
    });

    ScreenObjects.line = Blessed.line({
        parent: screen,
        orientation: 'vertical',
        fg: 'white',
        ch: '|',
        right: 19,
        height: '100%'
    });

    ScreenObjects.single = makeTestBox(screen, 0, '100%', '100%-20');
    ScreenObjects.single.hide();

    ScreenObjects.tests = [];

    for (var i = 0; i < Config.concurrency; i++)
    {
        ScreenObjects.tests.push(makeTestBox(screen, (i * percentage) + '%', percentage + '%', '100%-20'));
    }

    return ScreenObjects;
}

function makeTestBox(holder, top, height, width)
{
    var testBox = {};

    testBox._holder = Blessed.box({
        parent: holder,
        top: top,
        width: width,
        height: height
    });
    testBox._title = Blessed.text({
        parent: testBox._holder,
        width: '100%',
        top: 0,
        left: 0,
        style: {
            bg: 'white',
            fg: 'black'
        }
    });
    testBox._content = Blessed.box({
        parent: testBox._holder,
        top: 1,
        width: '100%',
        height: '100%-1',
        mouse: true,
        style: {
            bg: 'black',
            fg: 'white'
        },
        scrollable: true,
        scrollbar: {
            ch: ' ',
            style: {
                bg: 'white'
            }
        }
    });

    testBox.setTitle = function (title)
    {
        testBox._title.setContent(title);
    };

    testBox.appendContent = function (content)
    {
        testBox._content.content += content.toString();
        testBox._content.scroll(100);
    };

    testBox.reset = function ()
    {
        testBox.setTitle("");
        testBox._content.setContent("");
    };

    testBox.show = function ()
    {
        testBox._holder.show()
    };
    testBox.hide = function ()
    {
        testBox._holder.hide()
    };

    return testBox;
}

function showResult(screen, render, results)
{
    var screenOverlay, resultBox, passed = [], failed = [];

    results.forEach(function (result)
    {
        result.passed ? passed.push(result) : failed.push(result);
    });

    screenOverlay = Blessed.box({
        parent: screen,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        style: {
            bg: 'black'
        }
    });

    render();

    resultBox = Blessed.box({
        parent: screen,
        height: 9,
        width: '80%',
        top: 'center',
        left: 'center',
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            bg: 'black',
            border: {
                fg: 'white'
            }
        }
    });

    Blessed.box({
        parent: resultBox,
        left: 'center',
        width: 'shrink',
        height: 1,
        top: 0,
        content: 'Results',
        underline: true
    });

    Blessed.box({
        parent: resultBox,
        top: 2,
        left: 'center',
        width: 'shrink',
        height: 1,
        tags: true,
        content: '{green-bg}' + passed.length + ' Passed{/green-bg} {white-fg}|{/white-fg} {red-bg}' + failed.length + ' Failed {/red-bg}',
        style: {
            fg: 'black'
        }
    });

    if (failed.length)
    {
        Blessed.box({
            parent: resultBox,
            left: 'center',
            width: '100%-2',
            top: 3,
            height: 1,
            content: 'Failed Versions: ' + failed.map(function (r)
            {
                return 'v' + r.version;
            }).join(', ')
        });
    }

    Blessed.box({
        parent: resultBox,
        width: '100%-2',
        height: 1,
        top: 5,
        content: 'Press R to review'
    });

    Blessed.box({
        parent: resultBox,
        width: '100%-2',
        height: 1,
        top: 6,
        content: 'Press Enter or Q to exit'
    });

    render();

    return new Promise(function (resolve)
    {
        screen.screen.onceKey(['r'], function ()
        {
            screenOverlay.destroy();
            resultBox.destroy();
            render();
        });

        screen.screen.onceKey(['enter', 'q'], function ()
        {
            resolve();
        });
    });
}

function flattenArrays(arrays)
{
    return [].concat.apply([], arrays);
}
