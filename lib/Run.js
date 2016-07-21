var Pad, Blessed, Commands, Config, Docker, Promise;

Pad = require('pad');
Promise = require('bluebird');
Blessed = require('blessed');
Commands = require('./Commands');
Config = require('./Config');
Docker = require('./Docker');

module.exports = Run;

function Run(screen, render)
{
    return Promise.try(function ()
    {
        return Docker.containerExists(Config.name);
    }).then(function (exists)
    {
        if (!exists)
        {
            throw new Error("Please run setup first.");
        }
    }).then(function ()
    {
        var tests = [],
            square,
            width,
            height,
            currentColumn = 0,
            currentRow = 0,
            currentRunning = -1,
            runNext;

        runNext = function ()
        {
            if (++currentRunning < tests.length)
            {
                tests[currentRunning].start();
                tests[currentRunning].tap(runNext);
            }
        };

        square = Math.ceil(Math.sqrt(Config.versions.length));
        width = Math.floor(100 / square);
        height = Math.floor(100 / (Math.ceil(Config.versions.length / square)));

        currentColumn = 0;
        currentRow = 0;

        Config.versions.forEach(function (version)
        {
            tests.push(setupTest(screen, render, version, width, height, currentColumn, currentRow));

            currentColumn++;
            if (currentColumn == square)
            {
                currentColumn = 0;
                currentRow++;
            }
        });

        for (var i = 0; i < Config.concurrency && i < Config.versions.length; i++)
        {
            runNext();
        }

        return Promise.all(tests);
    }).then(function (results)
    {
        return showResult(screen, render, results);
    });
}

function setupTest(screen, render, version, width, height, column, row)
{
    var test, holderBox, logBox, titleBox, statusText, versionText, start;


    holderBox = Blessed.box({
        parent: screen,
        width: width + '%',
        height: height + '%',
        top: (row * height) + '%',
        left: (column * width) + '%',
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

    titleBox = Blessed.box({
        parent: holderBox,
        top: 0,
        left: 'center',
        width: '100%-2',
        style: {
            fg: 'black',
            bg: 'white'
        }
    });

    versionText = Blessed.text({
        parent: titleBox,
        top: 0,
        left: 0,
        content: 'Node v' + version,
        style: {
            fg: 'black',
            bg: 'white'
        }
    });

    statusText = Blessed.text({
        parent: titleBox,
        top: 0,
        right: 0,
        content: 'Queued',
        style: {
            fg: 'black',
            bg: 'white'
        }
    });

    logBox = Blessed.box({
        parent: holderBox,
        top: 1,
        left: 0,
        right: 0,
        bottom: 0,
        mouse: true,
        scrollable: true,
        scrollbar: {
            ch: ' ',
            style: {
                bg: 'white',
                fg: 'blue'
            }
        }
    });


    render();

    test = new Promise(function (resolve)
    {
        start = resolve;
    }).then(function ()
    {
        titleBox.style.bg = 'yellow';
        versionText.style.bg = 'yellow';
        statusText.style.bg = 'yellow';

        statusText.content = 'Running';
        render();
    }).then(function ()
    {
        return Commands.test(version, function runDataLogger(data)
        {
            logBox.content += data.toString();
            logBox.scroll(20);
            render();
        });
    }).then(function ()
    {
        return {
            version: version,
            passed: true
        };
    }).catch(function ()
    {
        return {
            version: version,
            passed: false
        };
    }).tap(function (result)
    {
        if (result.passed)
        {
            titleBox.style.bg = 'green';
            versionText.style.bg = 'green';
            statusText.style.bg = 'green';
            statusText.content = 'Passed';
        }
        else
        {
            versionText.style.fg = 'white';
            statusText.style.fg = 'white';
            titleBox.style.bg = 'red';
            versionText.style.bg = 'red';
            statusText.style.bg = 'red';
            statusText.content = 'Failed';
        }
        render();
    });

    //noinspection JSUnusedAssignment
    test.start = start;

    return test;
}

function showResult(screen, render, results)
{
    var screenOverlay, resultBox, bodyBox, top;

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
        width: 30,
        height: results.length + 6,
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
        width: '100%-2',
        height: 1,
        top: 0,
        content: 'Result',
        style: {
            fg: 'black',
            bg: 'white'
        }
    });

    bodyBox = Blessed.box({
        parent: resultBox,
        width: '100%-2',
        top: 1,
        height: results.length
    });

    top = 0;

    results.forEach(function (result)
    {
        Blessed.box({
            parent: bodyBox,
            width: '100%',
            height: 1,
            top: top++,
            style: {
                fg: 'black',
                bg: result.passed ? 'green' : 'red'
            },
            content: Pad('v' + result.version, 10) + ': ' + (result.passed ? 'Passed' : 'Failed')
        });
    });

    Blessed.box({
        parent: bodyBox,
        width: '100%',
        height: 1,
        top: ++top,
        content: 'Press R to review'
    });

    Blessed.box({
        parent: bodyBox,
        width: '100%',
        height: 1,
        top: ++top,
        content: 'Press Enter or Q to exit'
    });

    render();

    return new Promise(function (resolve) {
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
