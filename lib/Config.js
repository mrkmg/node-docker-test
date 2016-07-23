var Config, ndtConfig, args, extend, os, packageJson, pick;

extend = require('xtend');
os = require('os');
pick = require('lodash.pick');

args = require('yargs')
    .usage('Usage: $0 [options]')
    .example('$0 -c 3 -v "major" -v "minor | eq 4"', 'Test again all major versions and minor versions of 4. Run 3 concurrently')
    .option('concurrency', {
        alias: 'c',
        default: os.cpus().length,
        describe: 'Number of concurrent tests to run.',
        type: 'number'
    })
    .option('commands', {
        alias: 'x',
        default: ['npm test'],
        describe: 'The commands to run for test.',
        type: 'array'
    })
    .option('versions', {
        alias: 'v',
        default: ['major', '0.12'],
        describe: 'Which versions to run.',
        array: true,
        string: true
    })
    .option('setup', {
        default: false,
        describe: 'Run the setup.',
        type: 'boolean'
    })
    .option('reset', {
        alias: 'r',
        default: false,
        describe: 'When running setup, remove the previous image instead of re-using it.',
        type: 'version'
    })
    .option('package', {
        alias: 'p',
        default: './package.json',
        describe: 'Path to the package.json file.',
        type: 'string'
    })
    .option('setup-commands', {
        alias: 's',
        default: [],
        describe: 'Extra commands to run during setup.',
        type: 'array'
    })
    .help('h')
    .alias('h', 'help')
    .epilog('View the full documentation at https://github.com/mrkmg/node-docker-test')
    .argv;


try
{
    packageJson = require(process.cwd() + '/' + args.p);
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

Config = extend(ndtConfig, pick(args, ['setup', 'concurrency', 'versions', 'reset', 'commands', 'setup-commands']));

module.exports = Config;
