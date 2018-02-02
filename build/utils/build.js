
const logError = require('./logError');
const buildEntry = require('./buildEntry');

/**
* 生成文件
* 
* @param {any} configTell Generator对象
*/
module.exports = function build(configTell) {
   let _config = configTell.next();
   let config = _config.value;
   if (!_config.done) {
       buildEntry(config).then(() => {
               build(configTell);
       }).catch(logError);
   }
}