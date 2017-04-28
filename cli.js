/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <https://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
var Promise, Config, Run, Setup;

Promise = require('bluebird');

Config = require('./lib/utils/Config');

Run   = require('./lib/actions/Run');
Setup = require('./lib/actions/Setup');

return Promise
    .try(function () {
        var config = Config.parse();

        if (config.setup) {
            return Setup(config);
        }
        else {
            return Run(config);
        }
    })
    .then(function () {
        process.exit(0);
    })
    .catch(function (e) {
        if (process.env.DEBUG) {
            console.error(e);
        }
        else {
            console.error(e.message);
        }
        process.exit(255);
    });





