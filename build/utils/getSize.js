/**
* 获取文件大小
* 
* @param {any} code 文件内容
* @returns {String}
*/
module.exports = function getSize(code) {
   return (code.length / 1024).toFixed(2) + 'kb';
}