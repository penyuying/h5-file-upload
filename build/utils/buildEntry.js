const rollup = require('rollup');
const logError = require('./logError');
const write = require('./write');
const uglify = require('uglify-js');

/**
 * build文件
 * 
 * @param {Object} config build配置
 * @returns {Promise}
 */
module.exports = function buildEntry(config) {
    let dest = config.output.file;
    const isProd = /min\.js$/.test(dest);
    return rollup.rollup(config).then((bundle) => {
      const _generate = bundle.generate(config);
      _generate.then(data => {
          let code = data.code;
        if (isProd) {
            var minified = (config.banner ? config.banner + '\n' : '') + uglify.minify(code, {
                output: {
                  ascii_only: true
                },
                compress: {
                  pure_funcs: ['makeMap']
                }
              }).code;
            return write(dest, minified, true);
          } else {
            return write(dest, code);
          }
      });
    }).catch(logError);
}

