var expect, VersionKeywords;

expect = require('chai').expect;

VersionKeywords = require('../../../lib/VersionKeywords');

describe('versions-parsing', function ()
{

    it('commands', function ()
    {
        expect(this.config.commands).to.eql(['command1', 'command2']);
    });

    it('setup-commands', function ()
    {
        expect(this.config['setup-commands']).to.eql(['setup-command1', 'setup-command2']);
    });

    it('versions', function ()
    {
        expect(this.config.versions).to.eql(['version1', 'version2']);
    });

    it('concurrency', function ()
    {
        expect(this.config.concurrency).to.equal(99);
    });

    it('setup', function ()
    {
        expect(this.config.setup).to.equal(true);
    });

    it('reset', function ()
    {
        expect(this.config.reset).to.equal(true);
    });
});
