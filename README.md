# Node Docker Test

Test your node project against multiple node versions using docker.

![Demo]

## Installation

    npm install -g node-docker-test

## Usage

First, you will need to generate an image. ndt will create a separate image for each repository on your machine.

    cd /path/to/my/project
    ndt --setup

Once the setup is complete, you can run the test.

    ndt

-----------------

## Configuration

Configuration can be set via your package.json file or via command line arguments. Command line arguments always
override your package.json.

- [Commands](#commands)
- [Setup Commands](#setup-commands)
- [Versions](#versions)
- [Concurrency](#concurrency)
- [Setup](#setup)
- [Reset](#reset)
- [Simple Mode](#simple-mode)
- [Base Image](#base-image)

A minimal package.json file:

```json
{
    "name": "super-cool-package",
    "version": "1.0.0",
    "config": {
        "ndt": {
            "setup-commands": [
                "apt-get install -y curl",
                "mkdir -p /some/needed/folder"
            ],
            "commands": [
                "npm run setup-tests",
                "npm test"
            ],
            "versions": [
                "minor | lts",
                "major",
                "patch | gte:4.0 | lt:4.1",
                "0.12",
                "5.1.0"
            ],
            "concurrency": 2,
            "simple": false,
            "reset": true
        }
    }
}
```

A cli invocation with all options set for a setup:

```bash
ndt \
    --setup \
    -s "apt-get install -y curl" "mkdir -p /some/needed/folder" \
    -v "minor | lts" "major" "patch | gte:4.0 | lte: 4.1" "0.12" "5.1.0" \
    -b "centos" \
    -p "yum" \
    --yarn \
    --reset
```

A cli invocation with all options set for running tests:

```bash
ndt \
    -x "npm run setup-tests" "npm test" \
    -v "minor | lts" "major" "patch | gte:4.0 | lte: 4.1" "0.12" "5.1.0" \
    -c 2 \
    --simple \
    --yarn
```

#### Commands

> A string, or an array of strings. Each command will be executed during the test.
> 
> **Default:** `"npm test"`
> 
> - **JSON:** "commands"
> - **CLI:** --commands, -x

#### Setup Commands

> A string, or an array of strings. Each command will be executed during the setup.
> 
> **Default:** Empty
> 
> - **JSON:** "setup-commands"
> - **CLI:** --setup-commands, -s

#### Versions

> An array of versions. See [Versions Syntax](#versions-syntax)
> 
> **Default:** `["major"]`
> 
> - **JSON:** "versions"
> - **CLI:** --versions, -v

#### Concurrency

> The number of current tests to run. Only applicable for running tests.
> 
> **Default:** # CPUs - 1
> 
> - **JSON:** "concurrency"
> - **CLI:** --concurrency, -c
> 
> *It is recommended to NOT use the json key for concurrency as users with different systems may prefer to let ndt
> determine the number of concurrent tests to run based on their system.*

#### Setup

> Run the setup. Will not run any tests. If the project is already setup, the existing image will be used as the base.
> Run setup anytime to update the image.
> 
> **Default:** `false`
> 
> - **JSON:** N/A
> - **CLI:** --setup

#### Reset

> Do not re-use an existing image during setup. Useful if your setup scripts expect a clean environment. Only applicable
> for setup.
> 
> **Default:** `false`
> 
> - **JSON:** "reset"
> - **CLI:** --reset

#### Simple Mode

> Run the tests in simple mode. This will force a simple line-by-line output. Also in simple mode, the exit code is
> equal to the number of failed tests. Simple mode is most useful for small terminals or scripting. Only applicable for
> running the tests.
> 
> **Default:** `false`
> 
> - **JSON:** "simple"
> - **CLI:** --simple, -q

#### Base Image

> Specify the base image to build the testing image from. (debian, ubuntu, etc). Only applicable during setup. If you
change the base image, remember to use --reset during setup.
> 
> **Default:** `"debian:stable"`
> 
> - **JSON:** "base-image"
> - **CLI:** --base-image, -b
> 
> *ndt by default uses apt-get as the package manager. If you use a yum based distro, like centos or fedora, you will need to update the package-manager options as well*

#### Package Manager

> Specify the package manager to use when building the testing image.
>
> **Default:** "apt-get"
>
> **Valid Values:** "apt-get" or "yum"
>
> - **JSON:** "package-manager"
> - **CLI:** --package-manager, -p

#### Yarn

> Use yarn instead of npm for installing dependencies.
>
> **Default:** `false`
>
> - **JSON:**: "yarn"
> - **CLI:**: --yarn, -y
>
> *yarn will be installed if --yarn is passed at setup. If yarn was not installed during setup and used during testing, all tests will fail.*


-----------------------

## Versions Syntax

ndt sports a very flexible version syntax. The version syntax follows the following format:

    (version or keyword) | filter | filter | ...

You must specify one version or one keyword and then any number of filters (or zero). Whitespace is optional.

### Possible Versions

| Version | Example | Description                                     |
|:--------|:--------|:------------------------------------------------|
| X       | 6       | Resolves to the greatest single version of X.   |
| X.Y     | 6.1     | Resolves to the greatest single version of X.Y. |
| X.Y.Z   | 6.1.2   | Resolves to exactly X.Y.Z.                      |

### Possible Keywords

| Keyword | Description                                                                                          |
|:-------:|:-----------------------------------------------------------------------------------------------------|
|  major  | Resolves to a list of all the latest major versions. Does not include legacy versions.               |
|  minor  | Resolves to a list of all the latest minor versions. Does not include legacy versions.               |
|  patch  | Resolves to a list of all patch versions. Does not include legacy versions.                          |
| legacy  | Resolves to a list of all the legacy versions, which is everything that starts with major version 0. |
|   all   | Resolves to every single version available.                                                          |

*A note about versions < 0.10: They will not install unless you provide a build environment via the setup commands. See
the nvm documentation*

### Possible Filters

|   Filter    | Description                                                 |
|:-----------:|:------------------------------------------------------------|
| gt:version  | Filter to only versions greater than `version`.             |
| gte:version | Filter to only versions greater than or equal to `version`. |
| lt:version  | Filter to only versions less than `version`.                |
| lte:version | Filter to only versions less than or equal to `version`.    |
| eq:version  | Filter to only versions matching `version`.                 |
| neq:version | Filter to only versions not matching `version`.             |
|     lts     | Filter to only LTS versions.                                |

*`version` can be a partial version.*

### Examples

Minor versions of v6, and major versions of everything else.

    ndt -v "minor | eq:6" -v "major | lt:6"

All major versions, plus a subset of version 4 which had a bug your project needs to pay attention to.

    ndt -v "major" -v "patch | gte:4.2 | lte:4.6"

Every single LTS version and the *popular* legacy versions.

    ndt -v "patch | lts" -v  "0.12, 0.10"

*You do not need to worry if multiple versions overlap, as they are de-duplicated before running.*


-----------------------------

## API

ndt also ships with an API for calling the internal functions.

ndt relies heavily on Promises and Events.

### Version Parser

The Version Parser can parse the [ndt version syntax](#versions-syntax) and return an array of valid node versions.

`VersionParser(string|string[] version) -> Promise (string[] versions)`

You can pass either a string, or an array of strings in the ndt version syntax. A promise will resolve with valid nodejs
versions.

-----------------------------

### Setup Runner

The Setup Runner will build a docker image for use with the Test Runner.

`new SetupRunner(object options)`

**options**

All options are required.

- **name** (string) - A name for the image
- **baseImage** (string) - The base image to build from.
- **versions** (string[]) - Valid nodejs versions.
- **commands** (string[]) - Commands to be executed after the nodejs versions are installed.
- **reset** (boolean) - Whether to use an existing image under the same name, or to always use the baseImage.

**methods**

`.start() -> Promise()` Start the setup.

- Will resolve is setup is successful.
- Will reject is setup failed.

**events**

`.on('data', function (string){})` Emitted when the setup outputs to STDOUT or STDERR

-----------------------------

### Test Runner

The Test Runner will run tests on a project in an existing container.

`new TestRunner(object options)`

**options**

All options are required.

- **name** (string) - The name of the image to run the tests in.
- **versions** (string[]) - Valid nodejs versions.
- **commands** (string[]) - Commands to execute to run the tests.
- **concurrency** (int) - Number of concurrent tests to run.

**methods**

`.start() -> Promise(TestResult[])` Start the tests.

- Will resolve with an array of TestResults if the tests ran (Passed or Failed).
- Will reject if any tests failed to run.

`.stop()` Stop the tests.

- Currently running tests are allowed to finish. Any pending tests are skipped.

**events**

`.on('started'), function (){})` Emitted when the tests runner is started.

`.on('finished'), function (TestResult[]){})` Emitted when the tests runner is finished.

`.on('testStarted'), function (Test){})` Emitted when a test is started. See [Test](#test-object)

`.on('testData'), function (TestData){})` Emitted when a test writes to STDOUT or STDERR. See
[TestData](#testdata-object)

`.on('testFinished'), function (TestResult){})` Emitted when a test is finished. See [TestResult](#testresult-object)

`.on('runnerStarted'), function (int){})` Emitted when a runner started running tests. The int is the ID of the test
runner (0-indexed).

`.on('runnerFinished'), function (int){})` Emitted when a runner is finished running tests. The int is the ID of the
test runner (0-indexed).


##### Test Object

    {
        runner: int,        // The ID of the runner the test was run in.
        version: string     // The nodejs version the test is running for.
    }

##### TestData Object

    {
        runner: int,        // The ID of the runner the test was run on.
        version: string,    // The nodejs version the test is running for.
        data: string        // STDOUT or STDERR of the test. Only contains data since the last data event.
    }

##### TestResult Object

    {
        runner: int,        // The ID of the runner the test was run on.
        version: string,    // The nodejs verison the test was run for.
        passed: bool,       // If the test passed or failed.
        data: string        // All the STDOUT and STDERR of the test.
    }

#### API Example

Below is a contrived example of the API.

```javascript
var Promise = require('bluebird');
var ndt = require('node-docker-test');

var setupRunner, testRunner;

Promise
    .try(function () {
        return ndt.VersionParser(['6', '5.1']);
    })
    .then(function (versions) {
        setupRunner = new ndt.SetupRunner({
            name: 'custom:runner',
            baseImage: 'debian:latest',
            versions: versions,
            commands: [],
            reset: false
        });

        testRunner = new ndt.TestRunner({
            name: 'custom:runner',
            versions: versions,
            commands: ['npm run t'],
            concurrency: 2
        });

        setupRunner.on('data', function (data) { console.log(data); });

        testRunner.on('started', function () {
            console.log('started');
        });

        testRunner.on('finished', function (results) {
            console.log('finished', results);
        });

        testRunner.on('testStarted', function (test) {
            console.log('testStarted', test);
        });

        testRunner.on('testData', function (test) {
            console.log('testData', test);
        });

        testRunner.on('testFinished', function (test) {
            console.log('testFinished', test);
        });

        testRunner.on('runnerStarted', function (runner) {
            console.log('runnerStarted', runner);
        });

        testRunner.on('runnerFinished', function (runner) {
            console.log('runnerFinished', runner);
        });
    })
    .then(function () {
        return setupRunner.start();
    })
    .then(function () {
        return testRunner.start();
    })
    .then(function (results) {
        //results are here as well
    })
    .catch(function (error) {
        console.error('There was an error', error);
    });

```

-----------------------

## Other Notes

- The current working directory is copied into docker to the directory /test-src. Then that directory is rsync'd to
  /test excluding the node_modules folder (to ensure a new download of all the dependencies). The test is run from the
  /test directory.
- During setup, ndt will pre-download the versions specified during setup. You can re-run setup at any time to update
  the image to contain the versions specified at any time. It is recommended to re-run setup whenever there are new
  versions which match your config to prevent having to re-download the node binaries every time your run your tests. If
  `reset` is false, then the image will be re-used and any existing versions are not re-downloaded.
- ndt uses `debian:stable` as the base image.
- ndt just calls the docker command. You must be able to execute the `docker` application in order to use ndt. Please
  see your distribution's documentation for details on how to setup and use docker.
- Each command in `setup-commands` and `commands` will be joined with the "&&" operator. Therefor if any command fails,
  the entire setup or test is stopped.

## License

The MIT License (MIT) Copyright (c) 2016 Kevin Gravier

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[Demo]: http://i.imgur.com/kNFn9rV.gif
