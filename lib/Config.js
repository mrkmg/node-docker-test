var Config, ndtConfig, args, extend, os, packageJson, pick;

extend = require('extend');
os = require('os');
pick = require('lodash.pick');

args = require('yargs')
    .usage('Usage: $0 [options]')
    .example('$0 -c 3 -v "major" -v "minor | eq 4"', 'Test again all major versions and minor versions of 4. Run 3 concurrently')
    .option('concurrency', {
        alias: 'c',
        default: os.cpus().length - 1,
        describe: 'Number of concurrent tests to run.',
        type: 'number'
    })
    .option('commands', {
        alias: 'x',
        describe: 'The commands to run for test.',
        type: 'array'
    })
    .option('versions', {
        alias: 'v',
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
        describe: 'Extra commands to run during setup.',
        type: 'array'
    })
    .option('simple', {
        alias: 'q',
        describe: 'Run in simple mode. Runs the tests against all versions with very little output. Exit code is equal to the number of failed tests',
        type: 'boolean',
        default: false
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

Config = pick(extend(
    {
        simple: false,
        setup: false,
        reset: false,
        concurrency: os.cpus().length - 1,
        commands: ['npm test'],
        'setup-commands': [],
        versions: ['major', '0.12']
    },
    ndtConfig,
    args
), ['simple', 'setup', 'reset', 'name', 'concurrency', 'commands', 'setup-commands', 'versions']);

module.exports = Config;
