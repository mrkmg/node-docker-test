var Docker, Promise, Commands, Blessed, Config, Pad, screen, titleTextBox, bodyBox;

Docker = require('./lib/Docker');
Promise = require('bluebird');
Commands = require('./lib/Commands');
Blessed = require('blessed');
Config = require('./lib/Config');
Pad = require('pad');

main();

function main()
{
    var title = 'Node Docker Test (Press Q to quit)';

    screen = Blessed.screen({
        smartCSR: true
    });

    screen.key(['escape', 'q', 'C-c'], function ()
    {
        return process.exit(0);
    });

    screen.title = 'Node Docker Test';


    titleTextBox = Blessed.text({
        top: 0,
        left: 'center',
        width: title.length,
        height: 1,
        content: title
    });

    bodyBox = Blessed.box({
        top: 1,
        left: 0,
        right: 0,
        bottom: 0
    });



    screen.append(titleTextBox);
    screen.append(bodyBox);
    screen.render();

    switch (Config.action)
    {
        case 'setup':
            setup();
            break;
        case 'test':
            test();
            break;
    }
}

function test()
{
    var tests, square, width, height, currentColumn, currentRow, version, runningTests;

    Promise.try(function()
    {
        return Docker.containerExists(Config.name);
    }).then(function (exists)
    {
        if (!exists)
        {
            screen.destroy();
            console.error("Please run setup first.");
            process.exit(1);
        }
    }).then(function () {
        tests = [];
        runningTests = [];

        square = Math.ceil(Math.sqrt(Config.versions.length));
        width = Math.floor(100 / square);
        height = Math.floor(100 / (Math.ceil(Config.versions.length / square)));

        currentColumn = 0;
        currentRow = 0;

        for (var i in Config.versions)
        {
            version = Config.versions[i];

            tests.push(setupTest(version, width, height, currentColumn, currentRow));
            currentColumn++;

            if (currentColumn == square)
            {
                currentColumn = 0;
                currentRow++;
            }
        }


        var runNext = function ()
        {
            var test;

            if (tests.length)
            {
                test = tests.shift();

                runningTests.push(test().tap(runNext));
            }
            else
            {
                Promise.all(runningTests).then(function (results)
                {
                    showResult(results);
                }).catch(function (e)
                {
                    screen.destroy();
                    console.error(e);
                    process.exit(1);
                });
            }
        };

        for (var i = 0; i < Config.concurrency; i++)
        {
            runNext();
        }
    });
}

function setupTest(version, width, height, column, row)
{
    var box, log, title;

    box = Blessed.box({
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

    title = Blessed.text({
        top: 0,
        left: 'center',
        width: '100%-2',
        content: 'Node v' + version,
        style: {
            fg: 'black',
            bg: 'white'
        }
    });

    box.append(title);

    log = Blessed.box({
        top: 1,
        left: 0,
        right: 0,
        bottom: 0,
        mouse: true,
        scrollable: true
    });


    bodyBox.append(box);
    box.append(log);
    log.content = "Waiting...\n";
    screen.render();

    return function ()
    {
        title.style.bg = 'yellow';
        log.content += "Starting Test\n";
        screen.render();

        return Commands.test(version, function (data)
        {
            log.content += data.toString();
            log.setScrollPerc(100);
            screen.render();
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
        }).tap(function (result) {
            title.style.bg = result.passed ? 'green' : 'red';
            screen.render();
        });
    };
}

function showResult(results)
{
    var resultBox, title, body, result, top, overlay;

    overlay = Blessed.box({
        width: '100%',
        height: '100%',
        top: 0,
        left: 0
    });

    screen.append(overlay);

    resultBox = Blessed.box({
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

    title = Blessed.box({
        width: '100%-2',
        height: 1,
        top: 0,
        content: 'Tests Finished',
        style: {
            fg: 'black',
            bg: 'white'
        }
    });

    body = Blessed.box({
        width: '100%-2',
        top: 1,
        height: results.length
    });

    top = 0;
    for(var i in results)
    {
        result = results[i];

        body.append(Blessed.box({
            width: '100%',
            height: 1,
            top: top++,
            style: {
                fg: 'black',
                bg: result.passed ? 'green' : 'red'
            },
            content: Pad('v' + result.version, 10) + ': ' + (result.passed ? 'Passed' : 'Failed')
        }));
    }

    top++;

    body.append(Blessed.box({
        width: '100%',
        height: 1,
        top: top++,
        content: 'Press <enter> to review'
    }));

    body.append(Blessed.box({
    width: '100%',
    height: 1,
    top: top++,
    content: 'Press Q to exit'
}));

    screen.append(resultBox);
    resultBox.append(title);
    resultBox.append(body);
    screen.render();

    screen.key(['enter'], function ()
    {
        overlay.destroy();
        resultBox.destroy();
        screen.render();
    });
}

function setup()
{
    var outputCallback, outputBox;

    outputCallback = function (data)
    {
        outputBox.content += data.toString();
        outputBox.setScrollPerc(100);
        screen.render();
    };

    outputBox = Blessed.box({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        scrollable: true
    });

    outputBox.focus();

    bodyBox.append(outputBox);
    screen.render();

    Commands.setup(outputCallback).then(function ()
    {
        outputCallback("All done!, press <enter> to quit\n");

        screen.key(['enter'], function ()
        {
            return process.exit(0);
        });
    }).catch(function (e)
    {
        outputCallback(e);
    });
}
