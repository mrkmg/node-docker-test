
module.exports = function cleanConfig()
{
    delete require.cache[require.resolve('../../lib/utils/Config')];
    delete require.cache[require.resolve('yargs')];
}
