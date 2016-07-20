#Node Docker Test

Test your node project against multiple node version using docker.

## Installation

    npm install -g node-docker-test

## Usage

First, you will need to generate an image to use for the testing. Each project maintains it's own image for testing.

    cd /path/to/my/project
    ndt setup

Once the setup is complete, you can run the test

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
                    "4",
                    "5.0",
                    "5.1",
                    "6.2.1"
                ]
            }
        },
        ...
    }


The options available are:

**setupCommand**

`setupComamnd` can either be a string or an array of strings. This command will be run during the creation of the container. Use this to install dependencies.

Default: *Empty*

**command**

`command` can either be a string or an array of strings. This command will be executed when running a test. If the command exits with anything other than 0, the test is considered failed.

Default: *npm test*

**versions**

`versions` must be an array of string. Use this to specify versions to setup and run the tests against.

default: *["4", "5", "6"]*


## CLI Options

You can also pass the following arguments to the CLI

- **-c** Change the number of concurrent tests. Defaults to one less the number of processors on the system.
    - `ndt -c 3`
- **-v** A comma separated list of version to test for. Defaults to all versions set into the configuration.
    - `ndt -v 4.0.1,5.1,6`


### Other Notes

- ndt uses `debian:stable` as the base image.
- ndt just calls the docker command. You must be able to use docker as a user in order to use ndt. Please see your distribution for details on how to use docker.


### License

The MIT License (MIT)
Copyright (c) 2016 Kevin Gravier

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
