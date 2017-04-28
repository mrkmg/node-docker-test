var util, EventEmitter, Blessed, extend, Promise;

Promise      = require('bluebird');
EventEmitter = require('events');
Util         = require('util');
Blessed      = require('blessed');

extend = require('extend');

Util.inherits(RunGui, EventEmitter);

function RunGui(name) {
    var self         = this,
        title        = 'Node Docker Test - ' + name,
        introMessage = "Please Wait - Initializing Tests";

    self.Screen = Blessed.screen({
        smartCSR: true
    });

    self.Screen.key(['escape', 'C-c', 'q'], function () {
        self.emit('errored', new Error("User Canceled"));
    });

    self.Screen.title = title;

    Blessed.text({
        parent: self.Screen,
        top: 0,
        left: 'center',
        width: title.length,
        height: 1,
        content: title
    });

    self.Body = Blessed.box({
        parent: self.Screen,
        top: 1,
        left: 0,
        right: 0,
        bottom: 0
    });

    self.IntroMessage = Blessed.box({
        parent: self.Body,
        width: Math.max(introMessage.length + 2),
        height: 3,
        top: 'center',
        left: 'center',
        content: introMessage,
        padding: 1,
        style: {
            bg: 'white',
            fg: 'black'
        }
    });

    self.initialized    = false;
    self.resultListSize = 20;
    self.testBoxes      = [];
    self.versionRows    = [];

    self.Screen.render();

    self.on('updated', function () {
        self.Screen.render();
    });
}

RunGui.prototype.initialize = function initialize(number_tests, versions) {
    var self = this, percentage;

    self.IntroMessage.destroy();

    self._addResultList();

    percentage = Math.floor(100 / number_tests);

    for (var i = 0; i < number_tests; i++) {
        self._addTestBox((i * percentage) + '%', percentage + '%')
    }

    versions.forEach(function (version, i) {
        self._addVersionResultRow(i, version);
    });

    self.emit('updated');
};

RunGui.prototype.started = function started() {
    //TODO
};

RunGui.prototype.finished = function finished(results) {
    var self = this;

    self.on('versionClick', function (version) {
        var test = results.filter(function (t) {
            return t.version == version;
        })[0];

        self._reviewResult(version, test.data);
    });

    this._showResults(results);
};

RunGui.prototype.testStarted = function testStarted(test) {
    this._startTest(test.runner, test.version);
};

RunGui.prototype.testData = function testData(test) {
    this._writeTest(test.runner, test.data);
};

RunGui.prototype.testFinished = function testFinished(test) {
    this._finishTest(test.runner, test.version, test.passed);
};

RunGui.prototype.runnerStarted = function runnerStarted(runner) {
    //TODO
};

RunGui.prototype.runnerFinished = function runnerFinished(runner) {
    //TODO
};


RunGui.prototype.showError = function showError(error) {
    var self = this;

    if (typeof error !== 'string') {
        error = error.toString();
    }

    self.Body.hide();

    var continue_message = 'Click this message or press Q to quit';

    self.errorBox = Blessed.box({
        parent: self.Screen,
        width: Math.max(error.length + 2, continue_message.length + 2),
        height: 4,
        top: 'center',
        left: 'center',
        mouse: true,
        content: error + '\n' + continue_message,
        padding: 1,
        style: {
            bg: '#FF0000',
            fg: 'white'
        }
    });

    self.emit('updated');

    return new Promise(function (resolve) {
        self.Screen.screen.onceKey(['escape', 'enter', 'q'], function () {
            resolve();
        });

        self.errorBox.on('click', resolve);
    });

};

RunGui.prototype._addResultList = function _addResultList() {
    var self = this;

    self.resultList = Blessed.box({
        parent: self.Body,
        width: self.resultListSize - 1,
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
        parent: self.Body,
        orientation: 'vertical',
        inverse: false,
        ch: '|',
        right: self.resultListSize - 1,
        height: '100%'
    });

    self.emit('updated');
};

RunGui.prototype._addTestBox = function _addTestBox(top, height) {
    var self = this, testBox = {};

    testBox.holder = Blessed.box({
        parent: self.Body,
        top: top,
        left: 0,
        height: height,
        width: '100%-' + self.resultListSize
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

RunGui.prototype._addVersionResultRow = function _addVersionResultRow(top, version) {
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

    versionRow.holder.on('click', function () {
        self.emit('versionClick', version);
    });

    self.versionRows.push(versionRow);

    self.emit('updated');

};

RunGui.prototype._startTest = function _startTest(index, version) {
    var self = this, testBox = self.testBoxes[index], versionRow;

    testBox.title.setContent('v' + version);
    testBox.content.setContent('');

    versionRow = self._getVersionRow(version);

    versionRow.status.style.bg = 'yellow';
    versionRow.holder.style.bg = 'yellow';
    versionRow.name.style.bg   = 'yellow';
    versionRow.status.setContent('Running');

    self.emit('updated');
};

RunGui.prototype._writeTest = function _writeTest(index, data) {
    var self = this, testBox = self.testBoxes[index];

    testBox.content.content += data;
    testBox.content.scroll(100); // Some random amount to scroll by.

    self.emit('updated');
};

RunGui.prototype._finishTest = function _finishTest(index, version, result) {
    var self = this, testBox = self.testBoxes[index], versionRow;

    testBox.content.setContent('');
    testBox.title.setContent('');

    versionRow = self._getVersionRow(version);

    versionRow.status.style.bg = result ? 'green' : 'red';
    versionRow.holder.style.bg = result ? 'green' : 'red';
    versionRow.name.style.bg   = result ? 'green' : 'red';
    versionRow.status.setContent(result ? 'Passed' : 'Failed');

    self.emit('updated');
};

RunGui.prototype._showResults = function _showResults(results) {
    var self = this, passed = [], failed = [];

    results.forEach(function (result) {
        result.passed ? passed.push(result) : failed.push(result);
    });

    self.showResultScreenOverlay = Blessed.box({
        parent: self.Body,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0
    });

    self.showResultBox = Blessed.box({
        parent: self.Body,
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

    if (failed.length) {
        Blessed.box({
            parent: self.showResultBox,
            left: 'center',
            width: '100%-2',
            top: 3,
            height: 1,
            content: 'Failed Versions: ' + failed.map(function (r) {
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

    new Promise(function (resolve) {
        self.Screen.screen.onceKey(['r'], function () {
            self.showResultScreenOverlay.destroy();
            self.showResultBox.destroy();

            self.reviewTitle = Blessed.text({
                parent: self.Body,
                top: 0,
                left: 0,
                width: '100%-' + self.resultListSize,
                inverse: true
            });

            self.reviewContent = Blessed.box({
                parent: self.Body,
                top: 1,
                left: 0,
                height: '100%-1',
                width: '100%-' + self.resultListSize,
                scrollable: true,
                mouse: true,
                scrollbar: {
                    inverse: true
                }
            });

            self.emit('updated');
        });

        self.Screen.screen.onceKey(['enter', 'q'], function () {
            resolve();
        });
    }).then(function () {
        self.emit('finished');
    }).catch(function (err) {
        self.emit('errored', err);
    });
};

RunGui.prototype._reviewResult = function _reviewResult(version, content) {
    var self = this;

    self.Body.setContent('');
    self.reviewTitle.setContent('v' + version);
    self.reviewContent.setContent(content);
    self.reviewContent.setScroll(0);

    self.emit('updated');
};

RunGui.prototype._getVersionRow = function _getVersionRow(version) {
    return this.versionRows.filter(function (r) {
        return r.version == version;
    })[0];
};

RunGui.prototype.destroy = function deinit() {
    return this.Screen.destroy();
};

module.exports = RunGui;
