var Promise = require('bluebird');

module.exports = {
    containerExistsTrue: function (name) {
        return Promise.resolve(true)
    },
    containerExistsFalse: function (name) {
        return Promise.resolve(false);
    },
    runContainer: function (base, cmd, outputCallback) {
        return Promise.resolve()
    },
    getLastContainerSha: function () {
        return Promise.resolve('testsha');
    },
    commitContainer: function (sha, name) {
        return Promise.resolve()
    },
    _wait: function () {
        return Promise.resolve();
    }
};
