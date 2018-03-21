/**
 * 将输入的文件类型字符串转化为数组,原格式为*.jpg;*.png
 *
 * @param {String} str 文件名
 * @returns {Array<String>} 返回文件类型列表
 */
export function getFileTypes(str) {
    let result = [];
    let arr1 = str.split(';');
    for (let i = 0, len = arr1.length; i < len; i++) {
        let _ext = arr1[i].split('.').pop();
        if (_ext) {
            result.push(_ext.toLowerCase());
        }
    }
    return result;
}