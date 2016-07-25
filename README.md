# Node Docker Test

**ndt is still under heavy development. Expect potentially breaking changes until version 1 released.**

Test your node project against multiple node versions using docker.

![Demo]

## Installation

    npm install -g node-docker-test

## Usage

First, you will need to generate an image to use for the testing. Each project maintains it's own image for testing.

    cd /path/to/my/project
    ndt --setup

Once the setup is complete, you can run the test.

    ndt

## Configuration

You can add options for ndt to your package.json file to change the versions tested, install dependencies, or change the
default testing command. Below is an example `package.json` file.

    {
        ...
        "config": {
            "ndt": {
                "setup-commands": [
                    "apt-get install -y curl",
                    "mkdir /some/needed/folder"
                ],
                "commands": "npm run local-test",
                "versions": [
                    "minor | lts",
                    "major",
                    "patch | gte:4.0 | lt:4.1"
                    "0.12",
                    "5.1.0"
                ]
            }
        },
        ...
    }

### Configuration Options

| Option             | Default           | Description                                                                                          |
|:-------------------|:------------------|:-----------------------------------------------------------------------------------------------------|
| **setup-commands** | []                | A string, or an array of strings. Each string will be executed during the creation of the container. |
| **commands**       | "npm test"        | A string, or an array of string. Each string will be executed during the creation of the container.  |
| **versions**       | ["major", "0.12"] | An array of strings. Specify versions according the [Versions Syntax](#versions-syntax).             |


## CLI Usage

    ndt [options]

### CLI Options

| Options              | Type    | Default           | Description                                                                                                                       |
|:---------------------|:--------|:------------------|:----------------------------------------------------------------------------------------------------------------------------------|
| --concurrency, -c    | number  | # CPUS - 1        | Number of concurrent tests to run.                                                                                                |
| --commands, -x       | array   | ["npm test"]      | The commands to run for test. This argument can be specified multiple times.                                                      |
| --versions, -v       | array   | ["major", "0.12"] | Which versions to run. This argument can be specified multiple times. See the [Versions Syntax](#versions-syntax).                |
| --setup              | boolean | false             | Run the setup.                                                                                                                    |
| --reset, -r          | boolean | false             | When running setup, remove the previous image instead of re-using it.                                                             |
| --package, -p        | string  | ./package.json    | Path to the package.json file.                                                                                                    |
| --setup-commands, -s | array   | []                | Extra commands to run during setup. This argument can e specified multiple times.                                                 |
| --help, -h           | boolean | false             | Show help.                                                                                                                        |
| --simple, -q         | boolean | false             | Run in simple mode. Runs the tests against all versions with very little output. Exit code is equal to the number of failed tests |

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

| Keyword | Description                                                                                           |
|:-------:|:------------------------------------------------------------------------------------------------------|
|  major  | Resolves to a list of all the latest major versions. Does not include legacy versions.                |
|  minor  | Resolves to a list of all the latest minor versions. Does not include legacy versions.                |
|  patch  | Resolves to a list of all patch versions. Does not include legacy versions.                           |
| legacy  | Resolves to a list of all the legacy versions, which are everything that starts with major version 0. |
|   all   | Resolves to every single version available.                                                           |

*A note about versions < 0.10: They will not install unless you provide a build environment via the setup commands see
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

    ndt -v "major" -v "patch | gt:4.2 | lt:4.6"

Every single LTS version and the *popular* legacy versions.

    ndt -v "patch | lts" -v  "0.12, 0.10"

*You do not need to worry if multiple versions overlap, as they are de-duplicated before running*

## Other Notes

- The current working directory is copied into docker to the directory /test-src. Then that directory is rsync'd to
  /test excluding the node_modules folder (to ensure a new download of all the dependencies). Then test is run from the
  /test directory.
- During setup, ndt will pre-download the versions specified during setup. You can re-run setup at any time to update
  the image to contain the versions specified at any time. It is recommended to re-run setup whenever there are new
  versions which match your config to prevent having to re-download the node binaries every time your run your tests.
- ndt uses `debian:stable` as the base image.
- ndt just calls the docker command. You must be able to execute the `docker` application in order to use ndt. Please
  see your distribution's documentation for details on how to setup and use docker.
- Each command in `setup-commands` and `commands` will be joined with the "&&" operator. Therefor if any command fails,
  the setup or test is stopped.

## TODO Before Version 1

- [ ] Add tests
- [ ] Add quiet mode for testing
- [ ] ???

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
