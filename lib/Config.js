var Config, ndtConfig, args, extend, os;

extend = require('xtend');
os = require('os');
args = require('minimist')(process.argv.slice(2));

try
{
    ndtConfig = require(process.cwd() + '/package.json').config.ndt;
}
catch (e)
{
    ndtConfig = {}
}

Config = extend({
    action: 'test',
    versions: ['0.12', '4', '5', '6'],
    command: "npm test",
    setupCommand: "true",
    name: 'ndt:generic',
    concurrency: require('os').cpus().length - 1
}, ndtConfig);

if (args._.length > 0) Config.action = args._[0];

if (args.hasOwnProperty('c')) Config.concurrency = parseInt(args.c);
if (args.hasOwnProperty('v')) Config.versions = args.v.split(',');

module.exports = Config;
