var util, EventEmitter, Blessed, extend;

EventEmitter = require('events');
util = require('util');
Blessed = require('blessed');

extend = require('extend');

util.inherits(RunScreen, EventEmitter);

function RunScreen(Screen, config, number_tests, versions)
{
    var self = this;

    self.Screen = Screen;
    self.initialized = false;
    self.config = extend({resultListSize: 20}, config);
    self.testBoxes = [];
    self.versionRows = [];

    self.on('updated', function ()
    {
        self.Screen.render();
    });

    self.initialize(number_tests, versions);
}

RunScreen.prototype.initialize = function initialize(number_tests, versions)
{
    var self = this, percentage;

    self.addResultList();

    percentage = Math.floor(100 / number_tests);

    for (var i = 0; i < number_tests; i++)
    {
        self.addTestBox((i * percentage) + '%', percentage + '%')
    }

    versions.forEach(function (version, i)
    {
        self.addVersionResultRow(i, version);
    });

    self.emit('updated');
};

RunScreen.prototype.addResultList = function addResultList()
{
    var self = this;

    self.resultList = Blessed.box({
        parent: self.Screen.body,
        width: self.config.resultListSize - 1,
        height: '100%',
        right: 0,
        top: 0,
        scrollable: true,
        mouse: true,
        scrollbar: {
            inverse: true
        }
    });

    self.resultListLeftBorder = Blessed.line({
        parent: self.Screen.body,
        orientation: 'vertical',
        inverse: false,
        ch: '|',
        right: self.config.resultListSize - 1,
        height: '100%'
    });

    self.emit('updated');
};

RunScreen.prototype.addTestBox = function addTestBox(top, height)
{
    var self = this, testBox = {};

    testBox.holder = Blessed.box({
        parent: self.Screen.body,
        top: top,
        left: 0,
        height: height,
        width: '100%-' + self.config.resultListSize
    });

    testBox.title = Blessed.text({
        parent: testBox.holder,
        width: '100%',
        top: 0,
        left: 0,
        inverse: true
    });

    testBox.content = Blessed.box({
        parent: testBox.holder,
        top: 1,
        width: '100%',
        height: '100%-1',
        scrollable: true,
        mouse: true,
        scrollbar: {
            inverse: true
        }
    });

    self.testBoxes.push(testBox);

    self.emit('updated');
};

RunScreen.prototype.addVersionResultRow = function addVersionResultRow(top, version)
{
    var self = this, versionRow = {};

    versionRow.version = version;

    versionRow.holder = Blessed.box({
        parent: self.resultList,
        top: top,
        height: 1,
        left: 0,
        width: '100%-1',
        mouse: true,
        style: {
            bg: '#aaaaaa',
            fg: 'black'
        }
    });

    versionRow.name = Blessed.text({
        parent: versionRow.holder,
        left: 0,
        content: 'v' + version,
        style: {
            bg: '#aaaaaa',
            fg: 'black'
        }
    });

    versionRow.status = Blessed.text({
        parent: versionRow.holder,
        height: 1,
        right: 0,
        content: 'Pending',
        style: {
            bg: '#aaaaaa',
            fg: 'black'
        }
    });

    versionRow.holder.on('click', function ()
    {
        self.emit('versionClick', version);
    });

    self.versionRows.push(versionRow);

    self.emit('updated');

};

RunScreen.prototype.startTest = function startTest(index, version)
{
    var self = this, testBox = self.testBoxes[index], versionRow;

    testBox.title.setContent('v' + version);
    testBox.content.setContent('');

    versionRow = self.getVersionRow(version);

    versionRow.status.style.bg = 'yellow';
    versionRow.holder.style.bg = 'yellow';
    versionRow.name.style.bg = 'yellow';
    versionRow.status.setContent('Running');

    self.emit('updated');
};

RunScreen.prototype.writeTest = function writeTest(index, data)
{
    var self = this, testBox = self.testBoxes[index];

    testBox.content.content += data;
    testBox.content.scroll(100); // Some random amount to scroll by.

    self.emit('updated');
};

RunScreen.prototype.finishTest = function finishTest(index, version, result)
{
    var self = this, testBox = self.testBoxes[index], versionRow;

    testBox.content.setContent('');
    testBox.title.setContent('');

    versionRow = self.getVersionRow(version);

    versionRow.status.style.bg = result ? 'green' : 'red';
    versionRow.holder.style.bg = result ? 'green' : 'red';
    versionRow.name.style.bg = result ? 'green' : 'red';
    versionRow.status.setContent( result ? 'Passed': 'Failed');

    self.emit('updated');
};

RunScreen.prototype.showResults = function showResults(results)
{
    var self = this, passed = [], failed = [];

    results.forEach(function (result)
    {
        result.passed ? passed.push(result) : failed.push(result);
    });

    self.showResultScreenOverlay = Blessed.box({
        parent: self.Screen.body,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0
    });

    self.showResultBox = Blessed.box({
        parent: self.Screen.body,
        height: 9,
        width: '80%',
        top: 'center',
        left: 'center',
        border: {
            type: 'line'
        }
    });

    Blessed.box({
        parent: self.showResultBox,
        left: 'center',
        width: 'shrink',
        height: 1,
        top: 0,
        content: 'Results',
        underline: true
    });

    Blessed.box({
        parent: self.showResultBox,
        top: 2,
        left: 'center',
        width: 'shrink',
        height: 1,
        tags: true,
        content: '{green-bg}{black-fg} ' + passed.length + ' Passed {/black-fg}{/green-bg} | {red-bg}{black-fg} ' + failed.length + ' Failed {/black-fg}{/red-bg}',
    });

    if (failed.length)
    {
        Blessed.box({
            parent: self.showResultBox,
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
        parent: self.showResultBox,
        width: '100%-2',
        height: 1,
        top: 5,
        content: 'Press R to review'
    });

    Blessed.box({
        parent: self.showResultBox,
        width: '100%-2',
        height: 1,
        top: 6,
        content: 'Press Enter or Q to exit'
    });

    self.emit('updated');

    return new Promise(function (resolve)
    {
        self.Screen.screen.onceKey(['r'], function ()
        {
            self.showResultScreenOverlay.destroy();
            self.showResultBox.destroy();

            self.reviewTitle = Blessed.text({
                parent: self.Screen.body,
                top: 0,
                left: 0,
                width: '100%-' + self.config.resultListSize,
                inverse: true
            });

            self.reviewContent = Blessed.box({
                parent: self.Screen.body,
                top: 1,
                left: 0,
                height: '100%-1',
                width: '100%-' + self.config.resultListSize,
                scrollable: true,
                mouse: true,
                scrollbar: {
                    inverse: true
                }
            });

            self.emit('updated');
        });

        self.Screen.screen.onceKey(['enter', 'q'], function ()
        {
            resolve();
        });
    });
};

RunScreen.prototype.reviewResult = function reviewResult(version, content)
{
    var self = this;

    self.Screen.body.setContent('');
    self.reviewTitle.setContent('v' + version);
    self.reviewContent.setContent(content);
    self.reviewContent.setScroll(0);

    self.emit('updated');
};

RunScreen.prototype.getVersionRow = function getVersionRow(version)
{
    return this.versionRows.filter(function (r)
    {
        return r.version == version;
    })[0];
};

RunScreen.prototype.deinit = function deinit()
{

};

module.exports = RunScreen;
