const getConfig=require('./getConfig');

module.exports = function* (configs) {
    configs = getConfig(configs);
    let i = 0;
    const total = configs.length;

    while (i < total) {
        yield configs[i];
        i++;
    }
};