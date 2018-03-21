import { getRatio } from './getRatio';
/**
 * 图片压缩
 *
 * @param {HTMLElement} img 需要压缩的图片
 * @param {String} type 图片格式
 * @param {Number} index 图片索引
 * @param {File} file 图片原文件
 * @param {HTMLElement} el 绑定的元素
 * @param {Object} [option = config] 文件上传选项
 * @returns {String} 返回压缩后图片的base64码
 */
export function compress(img, type, index, file, el, option) {
    // let _this = this;
    // let option = _this._options;
    let initSize = img.src.length;
    let width = img.width;
    let _width = width;
    let height = img.height;
    let _height = height;
    let ratio = 1;
    let _ratio = 0;

    //    用于压缩图片的canvas
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    //    瓦片canvas
    let tCanvas = document.createElement('canvas');
    let tctx = tCanvas.getContext('2d');

    _ratio = getRatio(_width, _height, option);

    // 计算图片压缩后的大小
    if (_ratio > 1) {
        ratio = _ratio;
        width /= ratio;
        height /= ratio;
    }

    if (option.onCompressStart && option.onCompressStart instanceof Function) {
        option.onCompressStart({
            el: el,
            fileKey: option.fileKey,
            index: index, // 文件索引
            file: file,
            // base64Data: img.src,//文件内容
            size: initSize, // 压缩前大小
            width: _width, // 压缩前的宽度
            height: _height, // 压缩前的高度
            compressWidth: width, // 压缩后的宽度
            compressHeight: height, // 压缩后的高度
            ratio: ratio// 绽放的倍数
        });
    }

    canvas.width = width;
    canvas.height = height;

    //        铺底色
    ctx.fillStyle = option.compressBg || 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 如果图片像素大于100万则使用瓦片绘制
    let count;

    if ((count = width * height / (option.tile || 1000000)) > 1) {
        count = ~~(Math.sqrt(count) + 1); // 计算要分成多少块瓦片

        //            计算每块瓦片的宽和高
        let nw = ~~(width / count);
        let nh = ~~(height / count);

        tCanvas.width = nw;
        tCanvas.height = nh;

        for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
                tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);

                ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
            }
        }
    } else {
        ctx.drawImage(img, 0, 0, width, height);
    }

    // 进行最小压缩
    let ndata = canvas.toDataURL(type || 'image/png', option.encoderOptions || 0.6);

    if (option.onCompress && option.onCompress instanceof Function) {
        /**
         * @param {Number} index 当前文件索引
         * @param {Number} param1 文件Base码
         * @param {Number} param2 压缩前
         * @param {Number} param3 压缩后
         * @param {Number} param4 压缩率
         */
        option.onCompress({
            el: el,
            fileKey: option.fileKey,
            index: index, // 文件索引
            file: file,
            base64Data: ndata, // 文件内容
            currentSize: ndata.length, // 压缩后大小
            size: initSize, // 压缩前大小
            ratio: ~~(100 * (initSize - ndata.length) / initSize) + '%', // 压缩率
            width: _width, // 压缩前的宽度
            height: _height, // 压缩前的高度
            compressWidth: width, // 压缩后的宽度
            compressHeight: height // 压缩后的高度
        });
    }
    tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;// 清除画布的大小

    return ndata;
}