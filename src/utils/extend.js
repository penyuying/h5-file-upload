/**
 * 合并对象
 *
 * @param {any} def 默认对象
 * @param {any} nowObj 需要合并的对象
 * @returns {Object} 返回合并后的对象
 */
export function extend(def, nowObj) {
    // let _this = this;
    def = def || {};
    if (!nowObj) {
        return def;
    }
    for (let item in nowObj) {
        if (def[item] instanceof Object) {
            extend(def[item], nowObj[item]);
        } else {
            def[item] = nowObj[item];
        }
    }
    return def;
}