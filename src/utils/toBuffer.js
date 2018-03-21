import { getBlob } from './getBlob';
/**
 * 转文件流
 *
 * @param {String} basestr base64文本
 * @param {String} type 文件类型
 * @param {String} fileName 文件名
 * @returns {blob} 文件对象
 */
export function toBuffer(basestr, type, fileName) {
    let text = window.atob(basestr.split(',')[1]);
    let buffer = new Uint8Array(text.length); // ,
    // pecent = 0,
    // loop = null;

    for (let i = 0; i < text.length; i++) {
        buffer[i] = text.charCodeAt(i); // 返回指定索引处字符的 Unicode
    }

    let blob = getBlob([buffer], type);
    blob.name = fileName || '';
    return blob;
}