#Node Docker Test

Test your node project against multiple node versions using docker.

![Example](https://github.com/mrkmg/node-docker-test/blob/master/img/example.gif?raw=true)

## Installation

    npm install -g node-docker-test

## Usage

First, you will need to generate an image to use for the testing. Each project maintains it's own image for testing.

    cd /path/to/my/project
    ndt setup

Once the setup is complete, you can run the test.

    ndt

## Configuration

You can add options for ndt to your package.json file to change the versions tested, install dependencies, or change the default testing command. Below is an example `package.json` file.

    {
        ...
        "config": {
            "ndt": {
                "setupCommand": [
                    "apt-get install -y curl",
                    "mkdir /some/needed/folder"
                ],
                "command": "npm run local-test",
                "versions": [
                    "minor | lts",
                    "major",
                    "patch | gte:4.0 | lt:4.1"
                    "0.12",
                    "5.1.0",
                ]
            }
        },
        ...
    }


The options available are:

**setupCommand**

`setupCommand` can either be a string or an array of strings. This command will be run during the creation of the container. Use this to install dependencies.

Default: *Empty*

**command**

`command` can either be a string or an array of strings. This command will be executed when running a test. If the command exits with anything other than 0, the test is considered failed.

Default: *npm test*

**versions**

`versions` must be an array of string. Use this to specify versions to setup and run the tests against. See [Versions Syntax](#versions-syntax).

default: *["major", "0.12"]*


## CLI Options

You can also pass the following arguments to the CLI

- **-c** Change the number of concurrent tests. Defaults to one less the number of processors on the system.
    - `ndt -c 3`
- **-v** A comma separated list of versions to test for. Defaults to all versions set into the configuration. See [Versions Syntax](#versions-syntax).
    - `ndt -v "major | lts, minor | eq:4, patch | gte:4.2 | lt:4.4"`


## Versions Syntax

ndt sports a very flexible version syntax. The version syntax follows the following format:

    <keyword> | filter:argument | filter:argument | ...

You must specify one keyword. You can chain any number of filters together.

#### Possible Keywords

- A full nodejs version: e.g. `5.0.1`, `0.12.1`, `6.3.1`
- A partial nodejs version: e.g. `4`, `5.0`, `6.1`
    - The partial version will be resolved to the latest version matching the partial version.
- `major`
    - Resolves to a list of all the latest major versions. Does not include legacy versions.
    - As of July 21st 2016, it resolves to 4.4.7, 5.12.0, and 6.3.1
- `minor`
    - Resolves to a list of all the latest minor versions. Does not include legacy versions.
- `patch`
    - Resolves to a list of all patch versions.
- `legacy`
    - Resolved to a list of all the legacy versions, which are everything that starts with major version 0.

#### Possible Filters

- `gt:version` Filter to only versions greater than `version`.
- `gte:version` Filter to only versions greater than or equal to `version`.
- `lt:version` Filter to only versions less than `version`.
- `lte:version` Filter to only versions less than or equal to `version`.
- `eq` Filter to only versions matching `version`.
- `neq` Filter to only versions not matching `version`.
- `lts` Filter to only LTS versions.

*`version` can be a partial version.*

#### Examples

Minor versions of v6, and major versions of everything else.

    ndt -v "minor | eq:6, major | lt:6"

All major versions, plus a subset of version 4 which had a bug your project needs to pay attention to.

    ndt -v "major, patch | gt:4.2 | lt:4.6"

Every single LTS version and the popular legacy versions.

    ndt -v "patch | lts, 0.12, 0.10"

### Other Notes

- During setup, ndt will pre-download the versions specified during setup. You can re-run setup at any time to update the image to contain the version specified at any time. It is recommended to re-run setup whenever there are new versions which match your config to prevent having to redownload nodejs everytime your run your tests.
- ndt uses `debian:stable` as the base image.
- ndt just calls the docker command. You must be able to use docker as a user in order to use ndt. Please see your distribution for details on how to use docker.
- each command in `setupCommand` and `command` will be joined with the "&&" operator. Therefor if any command fails, the setup or test is stopped.


### License

The MIT License (MIT)
Copyright (c) 2016 Kevin Gravier

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
