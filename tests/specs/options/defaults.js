var expect, TestRepos, cleanConfig;

expect = require('chai').expect;

TestRepos = require('../../helpers/TestRepos');
cleanConfig = require('../../helpers/cleanConfig');

describe('defaults', function ()
{
    describe('no-config', function ()
    {
        before(function ()
        {
            this.previous_cwd = process.cwd();
            this.previous_argv = process.argv;

            process.argv = [
                'node', 'ndt'
            ];
            process.chdir(TestRepos.defaults());

            this.config = require('../../../lib/utils/Config').parse();
        });

        after(function ()
        {
            process.chdir(this.previous_cwd);
            process.argv = this.previous_argv;
            cleanConfig();
            TestRepos.cleanup();
        });

        it('commands', function ()
        {
            expect(this.config.commands).to.eql(['npm test']);
        });

        it('setup-commands', function ()
        {
            expect(this.config['setup-commands']).to.eql([])
        });

        it('versions', function ()
        {
            expect(this.config.versions).to.eql(['major']);
        });

        it('concurrency', function ()
        {
            expect(this.config.concurrency).to.equal(require('os').cpus().length - 1);
        });

        it('setup', function ()
        {
            expect(this.config.setup).to.equal(false);
        });

        it('reset', function ()
        {
            expect(this.config.reset).to.equal(false);
        })
    });
});
