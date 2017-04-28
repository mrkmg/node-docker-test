/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <https://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
var ndtApi = {};

module.exports = ndtApi;

ndtApi.VersionParser = require('./lib/utils/VersionParser');
ndtApi.SetupRunner   = require('./lib/SetupRunner');
ndtApi.TestRunner    = require('./lib/TestRunner');
