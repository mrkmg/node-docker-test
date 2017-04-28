/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <http://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
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
