
/**
 * 将文件的单位由bytes转换为KB或MB
 *
 * @param {Number} size 文件的大小（bit）
 * @param {Boolean} byKB 指定为true，则永远转换为KB
 * @returns {Number}
 */
export function formatFileSize(size, byKB) {
    if (size > 1024 * 1024 && !byKB) {
        size = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
    } else {
        size = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';
    }
    return size;
}