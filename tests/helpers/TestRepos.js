var fs, tmp;

fs = require('fs');
tmp = require('tmp');

module.exports = {

    defaults: function defaults()
    {
        return this._createSimpleJson('default', {});
    },

    allString: function allString()
    {
        return this._createSimpleJson('string', {
            commands: "commands-test",
            'setup-commands': 'setup-commands-test',
            'base-image': 'base-image-test'
        });
    },

    allArray: function allArray()
    {
        return this._createSimpleJson('array', {
            commands: ['commands-1', 'commands-2'],
            'setup-commands': ['setup-commands-1', 'setup-commands-2'],
            versions: ['4', 5, 'minor']
        });
    },

    allNumber: function allNumber()
    {
        return this._createSimpleJson('number', {
            concurrency: 99
        });
    },

    allBoolean: function allBoolean()
    {
        return this._createSimpleJson('boolean', {
            reset: true,
            simple: true,

        })
    },

    cleanup: function cleanup()
    {
        this._tmp_directories.forEach(function (tmp_directory)
        {
            tmp_directory.removeCallback();
        });
    },


    _tmp_directories: [],

    _createSimpleJson: function _createSimpleJson(name, ndt)
    {
        var dir = this._createDirectory();

        this._writeFileJson(dir + '/package.json', {
            name: 'ndt-testing' + name,
            config: {
                ndt: ndt
            }
        });

        return dir;
    },

    _createDirectory: function _createDirectory()
    {
        var dir = tmp.dirSync({
            unsafeCleanup: true
        });
        this._tmp_directories.push(dir);
        return dir.name;
    },

    _writeFile: function (file, content)
    {
        return fs.writeFileSync(file, content);
    },

    _writeFileJson: function (file, object)
    {
        return fs.writeFileSync(file, JSON.stringify(object));
    }
};
