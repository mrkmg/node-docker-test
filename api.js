var ndtApi = {};

module.exports = ndtApi;

ndtApi.VersionParser = require('./lib/utils/VersionParser');
ndtApi.SetupRunner = require('./lib/SetupRunner');
ndtApi.TestRunner = require('./lib/TestRunner');
ndtApi.Config = require('./lib/utils/Config');
