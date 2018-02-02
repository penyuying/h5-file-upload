const path = require('path');
/**
 * 绝对路径
 * 
 * @param {any} p 路径名称
 * @returns {String}
 */
module.exports = function resolve(p) {
    return path.resolve(process.cwd(), '', p);
};