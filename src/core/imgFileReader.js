import { inArray } from './../utils/inArray';
import { toBuffer } from './../utils/toBuffer';
import { compress } from './compress';
/**
 * 读取图片文件
 *
 * @param {File} file 文件对象
 * @param {Number} index 文件的索引号
 * @param {HTMLElement} el 绑定的元素
 * @param {Object} [option = config] 文件上传选项
 * @param {Function} readerSuccessCallback 读取完后的回调
 * @returns {file|null}
 */
export function imgFileReader(file, index, el, option, readerSuccessCallback) {
    // let _this = this;
    // let option = _this._options;
    let _ext = file.name.split('.').pop();

    // 如果图片格式不支持压缩或图片大小小于100kb，则直接上传
    if (!_ext || inArray(_ext.toLowerCase(), ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'jpe']) < 0 || !option.compressMinSize || file.size <= option.compressMinSize * 1024) {
        if (typeof readerSuccessCallback === 'function') {
            readerSuccessCallback(file, index);
        }
        return file;
    }

    let reader = new FileReader();

    reader.onload = function () {
        let result = this.result;
        let img = new Image();
        img.src = result;
        //      图片加载完毕之后进行压缩，然后上传
        if (img.complete) {
            callback();
        } else {
            img.onload = callback;
        }

        /**
         * 图片载完成或压缩完后的回调
         *
         */
        function callback() {
            let data = compress(img, file.type, index, file, el, option);// 压缩图片
            data = toBuffer(data, file.type, file.name);

            if (typeof readerSuccessCallback === 'function') {
                readerSuccessCallback(data, index);
            }
            img = null;
        }
    };

    reader.readAsDataURL(file);
}