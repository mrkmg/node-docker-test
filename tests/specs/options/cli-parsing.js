var expect, TestRepos, cleanConfig;

expect = require('chai').expect;

TestRepos   = require('../../helpers/TestRepos');
cleanConfig = require('../../helpers/cleanConfig');

describe('cli-parsing', function () {
    describe('no-config', function () {
        before(function () {
            this.previous_cwd  = process.cwd();
            this.previous_argv = process.argv;

            process.argv = [
                'node', 'ndt',
                '-x', 'command1', 'command2',
                '-s', 'setup-command1', 'setup-command2',
                '-v', 'version1', 'version2',
                '-c', '99',
                '-b', 'image:tag',
                "-p", "pkgmgr",
                '--setup',
                '--reset'
            ];
            process.chdir(TestRepos.defaults());

            this.config = require('../../../lib/utils/Config').parse();
        });

        after(function () {
            process.chdir(this.previous_cwd);
            process.argv = this.previous_argv;
            cleanConfig();
            TestRepos.cleanup();
        });

        it('commands', function () {
            expect(this.config.commands).to.eql(['command1', 'command2']);
        });

        it('setup-commands', function () {
            expect(this.config['setup-commands']).to.eql(['setup-command1', 'setup-command2']);
        });

        it('versions', function () {
            expect(this.config.versions).to.eql(['version1', 'version2']);
        });

        it('concurrency', function () {
            expect(this.config.concurrency).to.equal(99);
        });

        it('setup', function () {
            expect(this.config.setup).to.equal(true);
        });

        it('reset', function () {
            expect(this.config.reset).to.equal(true);
        });

        it('base-image', function () {
            expect(this.config['base-image']).to.equal('image:tag');
        });

        it('package-manager', function () {
            expect(this.config['package-manager']).to.equal('pkgmgr');
        });
    });

    describe('with-config', function () {
        before(function () {
            this.previous_cwd  = process.cwd();
            this.previous_argv = process.argv;

            process.argv = [
                'node', 'ndt',
                '-x', 'command1', 'command2',
                '-s', 'setup-command1', 'setup-command2',
                '-v', 'version1', 'version2',
                '-c', '80',
                '-b', 'image:tag',
                "-p", "pkgmgr",
                '--setup',
                '--reset'
            ];
            process.chdir(TestRepos.all());

            this.config = require('../../../lib/utils/Config').parse();
        });

        after(function () {
            process.chdir(this.previous_cwd);
            process.argv = this.previous_argv;
            cleanConfig();
            TestRepos.cleanup();
        });

        it('commands', function () {
            expect(this.config.commands).to.eql(['command1', 'command2']);
        });

        it('setup-commands', function () {
            expect(this.config['setup-commands']).to.eql(['setup-command1', 'setup-command2']);
        });

        it('versions', function () {
            expect(this.config.versions).to.eql(['version1', 'version2']);
        });

        it('concurrency', function () {
            expect(this.config.concurrency).to.equal(80);
        });

        it('setup', function () {
            expect(this.config.setup).to.equal(true);
        });

        it('reset', function () {
            expect(this.config.reset).to.equal(true);
        });

        it('base-image', function () {
            expect(this.config['base-image']).to.equal('image:tag');
        });

        it('package-manager', function () {
            expect(this.config['package-manager']).to.equal('pkgmgr');
        });
    })
});
