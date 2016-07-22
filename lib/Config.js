var Config, ndtConfig, args, extend, os, packageJson;

extend = require('xtend');
os = require('os');
args = require('minimist')(process.argv.slice(2));

try
{
    packageJson = require(process.cwd() + '/package.json');
}
catch (e)
{
    throw new Error('Missing the "package.json" file. Is this a NPM project?');
}

try
{
    ndtConfig = packageJson.config.ndt;
}
catch (e)
{
    ndtConfig = {};
}

ndtConfig.name = packageJson.name;

Config = extend({
    action: 'test',
    versions: ['0.12', 'major'],
    command: "npm test",
    setupCommand: "true",
    name: 'generic',
    concurrency: require('os').cpus().length - 1
}, ndtConfig);

if (args._.length > 0) Config.action = args._[0];

if (args.hasOwnProperty('c')) Config.concurrency = parseInt(args.c);
if (args.hasOwnProperty('v')) Config.versions = args.v.toString().split(',').map(trim);

module.exports = Config;

function trim(input)
{
    return input.toString().trim();
}