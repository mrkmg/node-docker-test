/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <https://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
var Promise, Semver, SemverLoose;

Promise     = require('bluebird');
Semver      = require('semver');
SemverLoose = require('semver-loose');

module.exports = VersionParser;

VersionParser.NODEJS_MIRROR    = "https://nodejs.org/dist/";
VersionParser.versionListCache = undefined;

function VersionParser(version) {
    var testVersion, filters;

    if (Array.isArray(version)) {
        return Promise
            .map(version, VersionParser)
            .then(flattenArrays)
            .then(Semver.sort)
            .then(dedupArray)
            .then(removeInvalid);
    }
    else {
        filters     = version.split('|').map(trim);
        testVersion = filters.shift();


        return Promise
            .resolve(testVersion)
            .then(resolveKeyword)
            .map(resolveVersion)
            .filter(function (version) {
                return Promise.reduce(filters, function (lastResult, filter) {
                    return Promise.try(function () {
                        return filterVersion(version, filter);
                    }).then(function (result) {
                        return result && lastResult;
                    })
                }, true);
            })
            .then(Semver.sort);
    }
}

function resolveKeyword(version) {
    switch (version) {
        case 'major':
            return major();
        case 'minor':
            return minor();
        case 'patch':
            return patch();
        case 'legacy':
            return legacy();
        case 'all':
            return all();
        default:
            return [version]
    }
}

function filterVersion(version, filterString) {
    var t, type, test;

    t = filterString.split(':').map(trim);

    type = t[0];
    test = t[1];

    switch (type) {
        case 'gt':
            return Promise
                .resolve(test)
                .then(resolveGreatestVersion)
                .then(function (t) {
                    return Semver.gt(version, t);
                });
        case 'gte':
            return Promise
                .resolve(test)
                .then(resolveLeastVersion)
                .then(function (t) {
                    return Semver.gte(version, t);
                });
        case 'lt':
            return Promise
                .resolve(test)
                .then(resolveLeastVersion)
                .then(function (t) {
                    return Semver.lt(version, t);
                });
        case 'lte':
            return Promise
                .resolve(test)
                .then(resolveGreatestVersion)
                .then(function (t) {
                    return Semver.lte(version, t);
                });
        case 'eq':
            return Promise.resolve(SemverLoose.match(test, version));
        case 'neq':
            return Promise.resolve(!SemverLoose.match(test, version));
        case 'lts':
            return Promise.resolve(version).then(isLts);
        default:
            throw new Error('Unknown filter type: ' + type);
    }
}

function resolveVersion(version) {
    return Promise
        .try(getVersionList)
        .map(extractVersion)
        .reduce(function (bestVersion, testVersion) {
            return SemverLoose.match(version, testVersion) && Semver.gt(testVersion, bestVersion)
                ? testVersion
                : bestVersion;
        }, '0.0.0');
}

function resolveGreatestVersion(version) {
    return Promise
        .try(getVersionList)
        .map(extractVersion)
        .reduce(function (bestVersion, testVersion) {
            return SemverLoose.match(version, testVersion) && Semver.gt(testVersion, bestVersion)
                ? testVersion
                : bestVersion;
        }, '0.0.0');
}

function resolveLeastVersion(version) {
    return Promise
        .try(getVersionList)
        .map(extractVersion)
        .reduce(function (bestVersion, testVersion) {
            return SemverLoose.match(version, testVersion) && Semver.lt(testVersion, bestVersion)
                ? testVersion
                : bestVersion;
        }, '9999999.9999999.9999999');
}

function major() {
    return Promise
        .try(notLegacy)
        .then(function (remoteVersions) {
            var versions = [], majorVersion;
            remoteVersions.forEach(function (version) {
                majorVersion = Semver.major(version).toString() + '.x';
                if (versions.indexOf(majorVersion) === -1) {
                    versions.push(majorVersion);
                }
            });

            return versions;
        });
}

function minor() {
    return Promise
        .try(notLegacy)
        .then(function (remoteVersions) {
            var versions = [], minorVersion;
            remoteVersions.forEach(function (version) {
                minorVersion = Semver.major(version) + '.' + Semver.minor(version);
                if (versions.indexOf(minorVersion) === -1) {
                    versions.push(minorVersion);
                }
            });

            return versions;
        });
}

function patch() {
    return Promise
        .try(notLegacy)
        .then(function (remoteVersions) {
            var versions = [], patchVersion;
            remoteVersions.forEach(function (version) {
                patchVersion = Semver.major(version) + '.' + Semver.minor(version) + '.' + Semver.patch(version);
                if (versions.indexOf(patchVersion) === -1) {
                    versions.push(patchVersion);
                }
            });

            return versions;
        });
}

function legacy() {
    return Promise
        .try(getVersionList)
        .map(extractVersion)
        .filter(isLegacy);
}

function notLegacy() {
    return Promise
        .try(getVersionList)
        .map(extractVersion)
        .filter(isNotLegacy)
}

function all() {
    return Promise
        .try(getVersionList)
        .map(extractVersion);
}

function getVersionList() {
    if (VersionParser.versionListCache) {
        return Promise.resolve(VersionParser.versionListCache);
    }
    else {
        return new Promise(function (resolve, reject) {
            var lib, body;
            lib     = VersionParser.NODEJS_MIRROR.substr(0, 5) == 'https' ? require('https') : require('http');
            request = lib.get(VersionParser.NODEJS_MIRROR + '/index.json', function (response) {
                if (response < 200 || response > 299) {
                    return reject('Failed to load nodejs version list from: ' + VersionParser.NODEJS_MIRROR);
                }

                body = [];

                response.on('data', function (data) {
                    body.push(data.toString());
                });
                response.on('end', function () {
                    try {
                        versionListCache = JSON.parse(body.join(''));
                    } catch (e) {
                        reject(e);
                    }
                    resolve(versionListCache);
                });
            });

            request.on('error', reject);
        });
    }
}

function isLegacy(version) {
    return Semver.major(version) == 0;
}

function isNotLegacy(version) {
    return !isLegacy(version);
}

function isLts(version) {
    return Promise
        .try(getVersionList)
        .reduce(function (passed, remoteVersion) {
            return passed || (Semver.eq(version, remoteVersion.version) && !!remoteVersion.lts);
        }, false);
}

function extractVersion(version) {
    return Semver.clean(version.version);
}

function trim(input) {
    return input.toString().trim();
}

function flattenArrays(arrays) {
    return [].concat.apply([], arrays);
}

function dedupArray(array) {
    return array.filter(function (i, p, s) {
        return s.indexOf(i) == p;
    });
}

function removeInvalid(array) {
    return array.filter(function (version) {
        return version != '0.0.0';
    })
}
