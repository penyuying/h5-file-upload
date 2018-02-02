/**
 * 字符绿色显示
 * 
 * @param {String} str 字符串
 * @returns {String}
 */
module.exports = function green(str) {
    return '\x1b[1m\x1b[32m' + str + '\x1b[39m\x1b[22m';
}