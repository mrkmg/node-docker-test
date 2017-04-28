var chai, expect, sinon, Docker, ChildProcess, SpawnStubs, DockerStubs;

chai   = require('chai');
expect = chai.expect;
sinon  = require('sinon');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

Docker       = require('../../../lib/utils/Docker');
ChildProcess = require('child_process');

SpawnStubs  = require('../../helpers/SpawnStubs');
DockerStubs = require('../../helpers/DockerStubs');

describe('Docker', function () {
    describe('containerExists', function () {
        beforeEach(function () {
            this.spawnStub = sinon.stub(ChildProcess, 'spawn').callsFake(SpawnStubs.containerExists);
        });

        afterEach(function () {
            this.spawnStub.restore();
        });

        it('spawn call', function () {
            Docker.containerExists('good');
            return expect(this.spawnStub).to.have.been.calledWith('docker', ['inspect', 'good']);
        });

        it('does exists', function () {
            return expect(Docker.containerExists('good')).to.eventually.equal(true);
        });

        it('does not exist', function () {
            return expect(Docker.containerExists('bad')).to.eventually.equal(false);
        });
    });

    describe('getLastContainerSha', function () {
        afterEach(function () {
            this.spawnStub.restore();
        });

        it('success', function () {
            this.spawnStub = sinon.stub(ChildProcess, 'spawn').callsFake(SpawnStubs.lastContainerShaGood);
            return expect(Docker.getLastContainerSha()).to.eventually.equal('stdout');
        });

        it('failed', function () {
            this.spawnStub = sinon.stub(ChildProcess, 'spawn').callsFake(SpawnStubs.lastContainerShaBad);
            return expect(Docker.getLastContainerSha()).to.be.rejectedWith(Error, 'Failed to get last SHA');
        })
    });

    describe('runContainer', function () {
        beforeEach(function () {
            this.spawnStub = sinon.stub(ChildProcess, 'spawn').callsFake(SpawnStubs.runContainer);
        });

        afterEach(function () {
            this.spawnStub.restore();
        });

        it('spawn call', function () {
            var outputSpy = sinon.spy();
            Docker.runContainer('good', ['command1', 'command2'], outputSpy);
            return expect(this.spawnStub).to.have.been.calledWith('docker', ['run', '-i', 'good', '/bin/bash', '-c', ['command1', 'command2']]);
        });

        it('resolves', function () {
            var outputSpy = sinon.spy();
            return expect(Docker.runContainer('good', ['command1', 'command2'], outputSpy)).to.be.fulfilled;
        });

        it('rejects', function () {
            var outputSpy = sinon.spy();
            return expect(Docker.runContainer('bad', ['command1', 'command2'], outputSpy)).to.be.rejected;
        });

        it('stdout', function () {
            var outputSpy = sinon.spy();
            Docker.runContainer('good', ['command1', 'command2'], outputSpy);
            expect(outputSpy).to.have.been.calledWith('stdout');
        });

        it('stderr', function () {
            var outputSpy = sinon.spy();
            Docker.runContainer('bad', ['command1', 'command2'], outputSpy).catch(function () {
            });
            expect(outputSpy).to.have.been.calledWith('stderr');
        });
    });

    describe('runContainerWithCopy', function () {
        beforeEach(function () {
            this.spawnStub = sinon.stub(ChildProcess, 'spawn').callsFake(SpawnStubs.runContainerWithCopy);
        });

        afterEach(function () {
            this.spawnStub.restore();
        });

        it('spawn call', function () {
            var outputSpy = sinon.spy();
            Docker.runContainerWithCopy('good', ['command1', 'command2'], outputSpy)
            return expect(this.spawnStub).to.have.been.calledWith('docker', ['run', '-i', '--rm', '-v', process.cwd() + ':/test-src/:ro', 'good', '/bin/bash', '-c', ['command1', 'command2']]);
        });

        it('resolves', function () {
            var outputSpy = sinon.spy();
            return expect(Docker.runContainerWithCopy('good', ['command1', 'command2'], outputSpy)).to.be.fulfilled;
        });

        it('rejects', function () {
            var outputSpy = sinon.spy();
            return expect(Docker.runContainerWithCopy('bad', ['command1', 'command2'], outputSpy)).to.be.rejected;
        });

        it('stdout', function () {
            var outputSpy = sinon.spy();
            Docker.runContainerWithCopy('good', ['command1', 'command2'], outputSpy);
            return expect(outputSpy).to.have.been.calledWith('stdout');
        });

        it('stderr', function () {
            var outputSpy = sinon.spy();
            Docker.runContainerWithCopy('bad', ['command1', 'command2'], outputSpy).catch(function () {
            });
            return expect(outputSpy).to.have.been.calledWith('stderr');
        });
    });

    describe('commitContainer', function () {
        beforeEach(function () {
            this.spawnStub = sinon.stub(ChildProcess, 'spawn').callsFake(SpawnStubs.commitContainer);
        });

        afterEach(function () {
            this.spawnStub.restore();
        });

        it('spawn call', function () {
            Docker.commitContainer('sha', 'good')
            return expect(this.spawnStub).to.have.been.calledWith('docker', ["commit", "sha", "good"]);
        });

        it('resolves', function () {
            return expect(Docker.commitContainer('sha', 'good')).to.be.fulfilled;
        });

        it('rejects', function () {
            return expect(Docker.commitContainer('sha', 'bad')).to.be.rejected;
        });
    });

    describe('makeNew', function () {
        beforeEach(function () {
            this.runContainerStub        = sinon.stub(Docker, 'runContainer').callsFake(DockerStubs.runContainer);
            this.getLastContainerShaStub = sinon.stub(Docker, 'getLastContainerSha').callsFake(DockerStubs.getLastContainerSha);
            this.commitContainerStub     = sinon.stub(Docker, 'commitContainer').callsFake(DockerStubs.commitContainer);
            this._waitStub               = sinon.stub(Docker, '_wait').callsFake(DockerStubs._wait);
            this.callbackSpy             = sinon.spy();
        });

        afterEach(function () {
            this.runContainerStub.restore();
            this.getLastContainerShaStub.restore();
            this.commitContainerStub.restore();
            this._waitStub.restore();
            this.callbackSpy.reset();
        });

        describe('exists', function () {
            beforeEach(function () {
                this.outputCallback      = function () {
                };
                this.containerExistsStub = sinon.stub(Docker, 'containerExists').callsFake(DockerStubs.containerExistsTrue);
                this.runPromise          = Docker.makeNew('new', 'command', 'old', this.outputCallback);
                return this.runPromise;
            });

            afterEach(function () {
                delete this.runPromise;
                this.containerExistsStub.restore();
            });

            it('fulfills', function () {
                return expect(this.runPromise).to.be.fulfilled;
            });

            it('call:containerExists', function () {
                return expect(this.containerExistsStub).to.have.been.calledWith('new')
            });

            it('call:runContainer', function () {
                return expect(this.runContainerStub).to.have.been.calledWith('new', 'command', this.outputCallback);
            });

            it('call:commitContainer', function () {
                return expect(this.commitContainerStub).to.have.been.calledWith('testsha', 'new');
            })
        });


        describe('doesnt exists', function () {
            beforeEach(function () {
                this.outputCallback      = function () {
                };
                this.containerExistsStub = sinon.stub(Docker, 'containerExists').callsFake(DockerStubs.containerExistsFalse);
                this.runPromise          = Docker.makeNew('new', 'command', 'old', this.outputCallback);
                return this.runPromise;
            });

            afterEach(function () {
                delete this.runPromise;
                this.containerExistsStub.restore();
            });

            it('fulfills', function () {
                return expect(this.runPromise).to.be.fulfilled;
            });

            it('call:containerExists', function () {
                return expect(this.containerExistsStub).to.have.been.calledWith('new')
            });

            it('call:runContainer', function () {
                return expect(this.runContainerStub).to.have.been.calledWith('old', 'command', this.outputCallback);
            });

            it('call:commitContainer', function () {
                return expect(this.commitContainerStub).to.have.been.calledWith('testsha', 'new');
            })
        });


    })
});
