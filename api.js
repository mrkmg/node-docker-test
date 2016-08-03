var ndtApi = {};

module.exports = ndtApi;

ndtApi.versionParser = require('./lib/utils/VersionKeywords');
ndtApi.setupRunner = require('./lib/SetupRunner');
ndtApi.testRunner = require('./lib/TestRunner');
ndtApi.Config = require('./lib/utils/Config');
