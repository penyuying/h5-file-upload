/**
* 获取blob对象的兼容性写法
* @param {Uint8Array<buffer>} buffer buffer列表
* @param {String} format 文件类型
* @returns {Blob}
*/
export function getBlob(buffer, format) {
    try {
        return new Blob(buffer, { type: format });
    } catch (e) {
        let bb = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder)();
        buffer.forEach(function (buf) {
            bb.append(buf);
        });
        return bb.getBlob(format);
    }
}