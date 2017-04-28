/*
 Written by Kevin Gravier <https://github.com/mrkmg>
 Part of the node-docker-test project. <http://github.com/mrkmg/node-docker-test>
 MIT Licence
 */
module.exports = function cleanConfig() {
    delete require.cache[require.resolve('../../lib/utils/Config')];
    delete require.cache[require.resolve('yargs')];
}
