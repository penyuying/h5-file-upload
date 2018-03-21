/**
 * 对比数组中的值
 *
 * @param {any} item 需要查找的值
 * @param {Array<any>} arr 数组
 * @returns {Number} 返回查找到的索引
 */
export function inArray (item, arr) {
    let res = -1;
    if (!item || !arr || arr.length <= 0) {
        return -1;
    }
    if (typeof item == 'string') {
        item = item.toLowerCase();
    }
    for (let i = 0; i < arr.length; i++) {
        let _item = arr[i];
        if (typeof _item == 'string') {
            _item = _item.toLowerCase();
        }
        if (item == _item) {
            res = i;
            break;
        }
    }
    return res;
}