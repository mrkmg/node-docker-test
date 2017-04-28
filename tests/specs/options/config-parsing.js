var expect, TestRepos, cleanConfig;

expect = require('chai').expect;

TestRepos = require('../../helpers/TestRepos');
cleanConfig = require('../../helpers/cleanConfig');

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
            expect(this.config['commands']).to.eql(['commands-1', 'commands-2']);
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

    describe('strings', function ()
    {
        before(function ()
        {
            this.previous_cwd = process.cwd();
            this.previous_argv = process.argv;

            process.argv = ['node', 'ndt'];
            process.chdir(TestRepos.allString());

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
            expect(this.config['commands']).to.eql('commands-test');
        });

        it('setup-commands', function ()
        {
            expect(this.config['setup-commands']).to.eql('setup-commands-test');
        });

        it('base-image', function ()
        {
            expect(this.config['base-image']).to.equal('base-image-test');
        });

        it('package-manager', function ()
        {
            expect(this.config['package-manager']).to.equal('package-manager-test');
        });
    });

    describe('integers', function ()
    {
        before(function ()
        {
            this.previous_cwd = process.cwd();
            this.previous_argv = process.argv;

            process.argv = ['node', 'ndt'];
            process.chdir(TestRepos.allNumber());

            this.config = require('../../../lib/utils/Config').parse();
        });

        after(function ()
        {
            process.chdir(this.previous_cwd);
            process.argv = this.previous_argv;
            cleanConfig();
            TestRepos.cleanup();
        });

        it('concurrency', function ()
        {
            expect(this.config['concurrency']).to.equal(99);
        });
    });

    describe('boolean', function ()
    {
        before(function ()
        {
            this.previous_cwd = process.cwd();
            this.previous_argv = process.argv;

            process.argv = ['node', 'ndt'];
            process.chdir(TestRepos.allBoolean());

            this.config = require('../../../lib/utils/Config').parse();
        });

        after(function ()
        {
            process.chdir(this.previous_cwd);
            process.argv = this.previous_argv;
            cleanConfig();
            TestRepos.cleanup();
        });

        it('reset', function ()
        {
            expect(this.config['reset']).to.equal(true);
        });

        it('simple', function ()
        {
            expect(this.config['simple']).to.equal(true);
        });
    });
});



