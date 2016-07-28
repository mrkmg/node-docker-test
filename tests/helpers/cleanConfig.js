
module.exports = function cleanConfig()
{
    delete require.cache[require.resolve('../../lib/Config')];
    delete require.cache[require.resolve('yargs')];
}
