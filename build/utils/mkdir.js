const fs = require('fs');
/**
 * 创建目录
 * 
 * @export
 * @param {any} dir 目录名称
 */
module.exports = function(dir) {
    if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync('dist');
    }
};