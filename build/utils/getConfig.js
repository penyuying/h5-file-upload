const babel = require('rollup-plugin-babel');
const banner = require('./banner');

/**
 * 获取配置项
 * 
 * @export
 * @param {Object} configs 配置参数
 * @returns {Array}
 */
module.exports = function getConfig(configs) {
    return repeatConfig(configs);
};

/**
 * 生成配置参数列表
 * 
 * @param {any} configs 配置选项
 * @returns {Array}
 */
function repeatConfig(configs) {
    let list=[];

    if(configs && configs.length) {
        configs.forEach(cfg => {
            let defObj={
                input: '',
                format: 'umd',
                name: '',
                output: {
                    file: ''
                },
                plugins: [
                    babel({
                        exclude: 'node_modules/**' // only transpile our source code
                    })
                ],
                banner
            };
            list.push(mergeConfig(defObj,cfg));
        });
    }

    return list;
}

/**
 * 合并配置参数
 * 
 * @param {any} def 默认参数
 * @param {any} ext 需要合并的参数
 * @returns {Object|Array}
 */
function  mergeConfig(def,ext) {
    let res=def||ext;
    if(!def || !ext) {
        return res;
    }
    for (const key in ext) {
        if (ext.hasOwnProperty(key)) {
            const item = ext[key];
            if(key!=='plugins' && item instanceof Object) {
                res[key]=mergeConfig(res[key],item);
            }else{
                if(key!=='plugins') {
                    res[key]=res[key].concat(item);
                }else{
                    res[key]=item;
                }
            }
        }
    }
    return res;
}