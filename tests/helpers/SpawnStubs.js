/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <http://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
module.exports = {
    containerExists: function (app, args) {
        return {
            on: function (type, cb) {
                if (args[1] == 'good') {
                    cb(0);
                } else {
                    cb(1);
                }
            }
        }
    },
    runContainer: function (app, args) {
        return {
            on: function (type, cb) {
                if (args[4] == 'good') {
                    cb(0);
                } else {
                    cb(1);
                }
            },
            stdout: {
                on: function (type, cb) {
                    if (args[4] == 'good') {
                        cb('stdout');
                    }
                }
            },
            stderr: {
                on: function (type, cb) {
                    if (args[4] != 'good') {
                        cb('stderr');
                    }
                }
            }
        }
    },
    runContainerWithCopy: function (app, args) {
        return {
            on: function (type, cb) {
                if (args[7] == 'good') {
                    cb(0);
                } else {
                    cb(1);
                }
            },
            stdout: {
                on: function (type, cb) {
                    if (args[7] == 'good') {
                        cb('stdout');
                    }
                }
            },
            stderr: {
                on: function (type, cb) {
                    if (args[7] != 'good') {
                        cb('stderr');
                    }
                }
            }
        }
    },
    lastContainerShaGood: function (app, args) {
        return {
            on: function (type, cb) {
                cb(0);
            },
            stdout: {
                on: function (type, cb) {
                    cb('stdout');
                }
            },
            stderr: {
                on: function (type, cb) {
                    cb('stderr');
                }
            }
        }
    },
    lastContainerShaBad: function (app, args) {
        return {
            on: function (type, cb) {
                cb(1);
            },
            stdout: {
                on: function (type, cb) {
                    cb('stdout');
                }
            },
            stderr: {
                on: function (type, cb) {
                    cb('stderr');
                }
            }
        }
    },
    commitContainer: function (app, args) {
        return {
            on: function (type, cb) {
                if (args[2] == 'good') {
                    cb(0);
                } else {
                    cb(1);
                }
            }
        }
    },
};
