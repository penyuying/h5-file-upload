const fs = require('fs');
const path = require('path');
const getSize = require('./getSize');
const green = require('./green');
const zlib = require('zlib');
/**
 * 写入文件
 * 
 * @param {any} dest 存放目录
 * @param {any} code 文件内容
 * @param {any} zip 是否gzip压缩
 * @returns {Promise}
 */
module.exports = function write(dest, code, zip) {
    return new Promise((resolve, reject) => {
      var report = (extra) => {
        console.log(green(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''));
        resolve();
      };

      fs.writeFile(dest, code, (err) => {
        if (err) {
          return reject(err);
        }
        if (zip) {
          zlib.gzip(code, (err, zipped) => {
            if (err) return reject(err);
            report(' (gzipped: ' + getSize(zipped) + ')');
          });
        } else {
          report();
        }
      });
    });
  }