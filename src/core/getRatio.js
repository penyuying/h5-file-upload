/**
 * 获取最大压缩的倍数（使用canvas对大图片进行压缩的倍数）
 *
 * @param {Number} width 图片的宽度
 * @param {NUmber} height 图片的高度
 * @param {Object} option 压缩选项
 * @param {Number} option.compressWidth 图片上传最大宽度
 * @param {Number} option.compressHeight 图片上传最大高度
 * @param {Number} option.compressTotal 图片上传最大像素数
 * @returns {Number} 返回最大压缩的倍数
 */
export function getRatio(width, height, option) {
    // 宽度压缩的倍数（水平像素数）
    let _width = (width / ((option.compressWidth > 0 && option.compressWidth) || width)) || 0;
    // 高度压缩的倍数（垂直像素数）
    let _height = (height / ((option.compressHeight > 0 && option.compressHeight) || height)) || 0;

    // 面积压缩的倍数（总像素）
    let _area = Math.sqrt(width * height / ((option.compressTotal > 0 && option.compressTotal) || width * height)) || 1;

    // 返回最大压缩的倍数
    return Math.max(Math.max(_width, _height) || 0, _area) || 1;
}