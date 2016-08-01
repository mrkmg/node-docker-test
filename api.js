var ndtApi = {}, Promise;

Promise = require('bluebird');

module.exports = ndtApi;

ndtApi.versions = function (versions)
{
    return Promise
        .resolve(versions)
        .then(require('./lib/utils/VersionKeywords'));
};
