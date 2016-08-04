var expect, Commands;

expect = require('chai').expect;

Commands = require('../../../lib/utils/Commands');

describe('Commands', function ()
{
    describe('string', function ()
    {
        before(function ()
        {
            this.setupCommands = Commands.setup(['1.2.3'], 'command1');
            this.testCommands = Commands.test('1.2.3', 'command1');
        });

        it('setup', function ()
        {
            expect(this.setupCommands).to.equal('echo "Starting" && apt-get update && apt-get upgrade -y && apt-get install -y git rsync wget && (mkdir /test || true) && wget https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -O install.sh && NVM_DIR=\'/nvm\' bash install.sh && source /nvm/nvm.sh && nvm install 1.2.3 && command1');
        });

        it('test', function ()
        {
            expect(this.testCommands).to.equal('source /nvm/nvm.sh && nvm install 1.2.3 && nvm use 1.2.3 && rsync -aAXx --delete --exclude .git --exclude node_modules /test-src/ /test/ && cd /test && npm install && command1');
        });
    });

    describe('arrays', function ()
    {
        before(function ()
        {
            this.setupCommands = Commands.setup(['1.2.3'], ['command1', 'command2']);
            this.testCommands = Commands.test('1.2.3', ['command1', 'command2']);
        });

        it('setup', function ()
        {
            expect(this.setupCommands).to.equal('echo "Starting" && apt-get update && apt-get upgrade -y && apt-get install -y git rsync wget && (mkdir /test || true) && wget https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -O install.sh && NVM_DIR=\'/nvm\' bash install.sh && source /nvm/nvm.sh && nvm install 1.2.3 && command1 && command2');
        });

        it('test', function ()
        {
            expect(this.testCommands).to.equal('source /nvm/nvm.sh && nvm install 1.2.3 && nvm use 1.2.3 && rsync -aAXx --delete --exclude .git --exclude node_modules /test-src/ /test/ && cd /test && npm install && command1 && command2');
        });
    })
});
