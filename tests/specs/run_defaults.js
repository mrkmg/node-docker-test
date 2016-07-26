var expect, TestRepos;

expect = require('chai').expect;

TestRepos = require('../helpers/TestRepos');

describe('config-parsing', function ()
{
    describe('arrays', function ()
    {
        before(function ()
        {
            this.previous_cwd = process.cwd();
            this.previous_argv = process.argv;

            process.argv = ['node', 'ndt'];
            process.chdir(TestRepos.allArray());

            this.config = require('../../lib/Config');
        });

        after(function ()
        {
            process.chdir(this.previous_cwd);
            process.argv = this.previous_argv;
            delete require.cache[require.resolve('../../lib/Config')];
            TestRepos.cleanup();
        });

        it('commands', function ()
        {
            expect(this.config.commands).to.eql(['commands-1', 'commands-2']);
        });

        it('setup-commands', function ()
        {
            expect(this.config['setup-commands']).to.eql(['setup-commands-1', 'setup-commands-2']);
        });

        it('versions', function ()
        {
            expect(this.config.versions).to.eql(['4', 5, 'minor']);
        });
    });

    describe('string', function ()
    {
        before(function ()
        {
            this.previous_cwd = process.cwd();
            this.previous_argv = process.argv;

            process.argv = ['node', 'ndt'];
            process.chdir(TestRepos.allString());

            this.config = require('../../lib/Config');
        });

        after(function ()
        {
            process.chdir(this.previous_cwd);
            process.argv = this.previous_argv;
            delete require.cache[require.resolve('../../lib/Config')];
            TestRepos.cleanup();
        });

        it('commands', function ()
        {
            expect(this.config.commands).to.eql(['commands-1', 'commands-2']);
        });

        it('setup-commands', function ()
        {
            expect(this.config['setup-commands']).to.eql(['setup-commands-1', 'setup-commands-2']);
        });

        it('versions', function ()
        {
            expect(this.config.versions).to.eql(['4', 5, 'minor']);
        });
    });
});
