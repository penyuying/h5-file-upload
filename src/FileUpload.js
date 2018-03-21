import { imgFileReader } from './core/imgFileReader';
import { getFormData } from './utils/getFormData';
import { createXMLHttpRequest } from './utils/createXMLHttpRequest';
import { extend } from './utils/extend';
import { config } from './core/defaultConfig';
import { createFileBtn } from './core/createFileBtn';
import { filtFilter } from './core/filtFilter';
/**
 * 文件上传插件
 * @class
 * @alias FileUpload
 * @param {Element} el 上传按钮放置的元素
 * @param {Object} opts 配置选项
 */
export function FileUpload(el, opts) {
    if (!el) { return; }
    this._el = el;
    let _options = this._options = extend(config, opts);
    _options.el = el;
    this._ongoingIndex = -1; // 正在上传的索引
    this._init();
}

FileUpload.prototype = {
    _init: function () {
        let _this = this;
        let option = _this._options;
        let _el = _this._el;
        _this._files = null;
        let _fileObj = _this._fileObj = createFileBtn(_el, option) || {};
        _fileObj.fileInput && _fileObj.fileInput.addEventListener('change', function (e) {
            _this._funGetFiles(e);
        });
        if (option.onInit && option.onInit instanceof Function) {
            option.onInit && option.onInit({
                el: _el,
                fileKey: option.fileKey
            });
        }
    },

    /**
    * 文件上传
    *
    * @param {File} file 上传的文件
    * @param {Number} index 文件索引
    * @param {Number} fileCount 文件数量
    * @param {Function} onUploadComplete 上关闭时的回调
    */
   _funUploadFile: function (file, index, fileCount, onUploadComplete) {
       let _this = this;
       let xhr = createXMLHttpRequest() || false;
       let option = _this._options;
       let el = _this._el;
       let _total = 0;

       if (xhr && xhr.upload && file) {
           // 上传中
           xhr.upload.addEventListener('progress', function (e) {
                _total = e.total;
               _this._onProgress(index, file, e.loaded, _total);
           }, false);

           // 文件上传成功或是失败
           xhr.onreadystatechange = function (e) {
               if (xhr.readyState == 4) {
                   if (xhr.status == 200) {
                       let _data = xhr.responseText;
                       // 校正进度条和上传比例的误差
                       _this._onProgress(index, file, _total, _total);
                       if (option.dataType == 'json') {
                           _data = JSON.parse(xhr.responseText);
                       }
                       if (typeof option.onUploadSuccess === 'function') {
                            option.onUploadSuccess({
                                el: el,
                                fileKey: option.fileKey,
                                file: file,
                                index: index,
                                fileCount: fileCount
                            }, _data);
                        }
                   } else {
                        if (typeof option.onUploadError === 'function') {
                            option.onUploadError({
                                el: el,
                                fileKey: option.fileKey,
                                file: file,
                                index: index,
                                fileCount: fileCount
                            }, xhr);
                        }
                   }

                   if (typeof onUploadComplete === 'function') {
                        onUploadComplete({
                           el: el,
                           fileKey: option.fileKey,
                           file: file,
                           index: index,
                           fileCount: fileCount
                       }, xhr);
                   }
               }
           };

           option.onUploadStart && option.onUploadStart({
               el: el,
               fileKey: option.fileKey,
               file: file,
               index: index,
               fileName: file.name,
               fileCount: fileCount
           });
           // 开始上传
           xhr.open(option.method, option.uploader, option.async || true);
           xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
           let fd = getFormData();// new FormData();

           if (file.name) {
               fd.append(option.fileObjName, file, file.name);
           } else {
               fd.append(option.fileObjName, file);
           }

           if (option.formData) {
               for (let key in option.formData) {
                   fd.append(key, option.formData[key]);
               }
           }

           xhr.send(fd);
       }
   },
    /**
     * 删除上传列表中的文件
     *
     * @param {Number} index 需要删除的文件的索引
     * @return {Boolean} 是否被删除
     */
    delFile: function (index) {
        let _this = this;
        // 不能删除正在上传中的
        if (_this._ongoingIndex + '' === index + '' && _this._files && _this._files.length > 0) {
            _this._files.splice(index, 1);
            return true;
        }
        return false;
    },
    /**
     * 文件改变时处理文件的文件
     *
     * @param {Event} e 事件对象
     */
    _funGetFiles: function (e) {
        let _this = this;
        let option = _this._options;
        // 获取文件列表对象
        let files = e.target.files;
        _this._files = null;

        if (option.onReaderFile instanceof Function) {
            option.onReaderFile({
                el: _this._el,
                fileKey: option.fileKey,
                files: files
            });
        }

        // 过滤文件
        files = filtFilter(files, _this._el, option);

        _this._files = files;
        if (option.auto) { // 判断是否是自动上传
            _this.submitUpload();
        }
    },

    /**
     * 提交上传
     */
    submitUpload: function () {
        let _this = this;
        let option = _this._options;
        let _fileObj = _this._fileObj;

        _fileUpLoad(_this._files[0], 0, _this._files.length);

        /**
         * 文件上传(使用递归的形式防止文件在列表中移除)
         *
         * @param {any} _file 上传的文件
         * @param {any} _i 上传的文件索引
         * @param {any} _len 上传文件的总数
         */
        function _fileUpLoad(_file, _i, _len) {
            if (_i < _len) {
                _this._ongoingIndex = _i; // 正在上传中的索引
                if (_file) {
                    _this._execUpload(_file, _i, _len, function(data, xhr) {
                        option.onUploadComplete && option.onUploadComplete(data, xhr);
                        _fileUpLoad(_this._files[_i + 1], _i + 1, _this._files.length);
                    });
                } else {
                    _fileUpLoad(_this._files[_i + 1], _i + 1, _this._files.length);
                }
            } else {
                // 清除文件选择框中的已有值
                _fileObj.fileInput.value = '';
                _fileObj = null;
                _this._files = null;
                _this._ongoingIndex = -1;
            }
        }
    },

    /**
     * 执行上传
     *
     * @param {file} file 当前上传的文件项
     * @param {Number} index 当前上传的文件项的索引
     * @param {Number} fileCount 文件的总数量
     * @param {Function} onUploadComplete 文件上传结束后的回调
     */
    _execUpload: function (file, index, fileCount, onUploadComplete) {
        let _this = this;
        let option = _this._options;
        try {
            imgFileReader(file, index, _this._el, option, function(_file, _index) {
                _this._funUploadFile(_file, _index, fileCount, onUploadComplete);
            });
        } catch (e) {
            _this._funUploadFile(file, index, fileCount, onUploadComplete);
        }
    },

    /**
     * 文件上传进度
     *
     * @param {Number} index 文件索引
     * @param {File} file 上传的文件
     * @param {Number} loaded 当前加载了多少字节流
     * @param {Number} total 总共有多少字节流
     */
    _onProgress: function (index, file, loaded, total) {
        let _this = this;
        let option = _this._options;
        if (typeof option.onProgress === 'function') {
            option.onProgress({
                el: _this._el,
                fileKey: option.fileKey,
                index: index,
                file: file,
                loaded: loaded, // 表示当前加载了多少字节流
                total: total// 表示总共有多少字节流
            });
        }
    }
};