import { getMime } from '../utils/getMime';
/**
 * 获取MIME列表
 *
 * @param {any} arr 文件类型列表
 * @returns {Array<String>} 文件MIME列表
 */
export function getAcceptList(arr) {
    let resArr = [];
    if (arr && arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
            let _mime = getMime(arr[i]);
            if (_mime) {
                resArr.push(_mime);
            }
        }
    }
    // if (resArr.length <= 0) {
    //     resArr.push('*');
    // } else {
    //     resArr.push('image/*');// 设置所有图片都支持选择（因为有些手机指定格式有问题）
    // }
    return resArr;
}