import { inArray } from '../utils/inArray';
import { formatFileSize } from '../utils/formatFileSize';
import { getFileTypes } from '../utils/getFileTypes';
/**
 * 过滤文件
 *
 * @param {Array<Flie>} files 文件列表
 * @param {HTMLElement} el 绑定的元素
 * @param {Object} [option = config] 文件上传选项
 * @returns {Array<Flie>} 返回可用符合条件的文件列表
 */
export function filtFilter(files, el, option) {
    // let _this = this;
    let arr = [];
    // let option = _this._options;
    let typeArray = getFileTypes(option.fileTypeExts);
    if (typeArray.length > 0) {
        for (let i = 0, len = files.length; i < len; i++) {
            let thisFile = files[i];

            if (parseInt(formatFileSize(thisFile.size, true)) > option.fileSizeLimit) {
                // alert('文件' + thisFile.name + '大小超出限制！');
                if (option.onSizeError instanceof Function) {
                    option.onSizeError({
                        el: el,
                        fileKey: option.fileKey,
                        index: i, // 当前文件的索引
                        fileName: thisFile.name, // 文件名
                        file: thisFile, // 文件
                        maxSize: formatFileSize(option.fileSizeLimit * 1024 || 0, true), // 限制的最大大小
                        size: formatFileSize(thisFile.size, true)// 当前文件大小
                    });
                }
                continue;
            }
            if (!typeArray || typeArray.length <= 0 || inArray('*', typeArray) >= 0 || inArray(thisFile.name.split('.').pop(), typeArray) >= 0) {
                arr.push(thisFile);
            } else {
                if (option.onFileTypeError && option.onFileTypeError instanceof Function) {
                    option.onFileTypeError({
                        el: el,
                        fileKey: option.fileKey,
                        index: i, // 当前文件的索引
                        fileName: thisFile.name, // 文件名
                        file: thisFile, // 文件
                        type: thisFile.name.split('.').pop(), // 当前文件类型
                        typeArray: typeArray// 所支持的类型
                    });
                }
                // alert('文件' + thisFile.name + '类型不允许！');
            }
        }
    }
    return arr;
}