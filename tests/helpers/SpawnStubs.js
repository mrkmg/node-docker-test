module.exports = {
    containerExists: function (app, args)
    {
        return {
            on: function (type, cb)
            {
                if (args[1] == 'good') cb(0);
                else cb(1);
            }
        }
    },
    runContainer: function (app, args)
    {
        return {
            on: function (type, cb)
            {
                if (args[2] == 'good') cb(0);
                else cb(1);
            },
            stdout: {
                on: function (type, cb)
                {
                    if (args[2] == 'good') cb('stdout');
                }
            },
            stderr: {
                on: function (type, cb)
                {
                    if (args[2] != 'good') cb('stderr');
                }
            }
        }
    },
    runContainerWithCopy: function (app, args)
    {
        return {
            on: function (type, cb)
            {
                if (args[5] == 'good') cb(0);
                else cb(1);
            },
            stdout: {
                on: function (type, cb)
                {
                    if (args[5] == 'good') cb('stdout');
                }
            },
            stderr: {
                on: function (type, cb)
                {
                    if (args[5] != 'good') cb('stderr');
                }
            }
        }
    },
    lastContainerShaGood: function (app, args)
    {
        return {
            on: function (type, cb)
            {
                cb(0);
            },
            stdout: {
                on: function (type, cb)
                {
                    cb('stdout');
                }
            },
            stderr: {
                on: function (type, cb)
                {
                    cb('stderr');
                }
            }
        }
    },
    lastContainerShaBad: function (app, args)
    {
        return {
            on: function (type, cb)
            {
                cb(1);
            },
            stdout: {
                on: function (type, cb)
                {
                    cb('stdout');
                }
            },
            stderr: {
                on: function (type, cb)
                {
                    cb('stderr');
                }
            }
        }
    },
    commitContainer: function (app, args)
    {
        return {
            on: function (type, cb)
            {
                if (args[2] == 'good') cb(0);
                else cb(1);
            }
        }
    },
};
