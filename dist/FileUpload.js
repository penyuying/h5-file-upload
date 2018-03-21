/*!
 * h5-file-upload v1.0.2
 * (c) 2017-2018 penyuying
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.FileUpload = {})));
}(this, (function (exports) { 'use strict';

/**
 * 对比数组中的值
 *
 * @param {any} item 需要查找的值
 * @param {Array<any>} arr 数组
 * @returns {Number} 返回查找到的索引
 */
function inArray(item, arr) {
    var res = -1;
    if (!item || !arr || arr.length <= 0) {
        return -1;
    }
    if (typeof item == 'string') {
        item = item.toLowerCase();
    }
    for (var i = 0; i < arr.length; i++) {
        var _item = arr[i];
        if (typeof _item == 'string') {
            _item = _item.toLowerCase();
        }
        if (item == _item) {
            res = i;
            break;
        }
    }
    return res;
}

/**
* 获取blob对象的兼容性写法
* @param {Uint8Array<buffer>} buffer buffer列表
* @param {String} format 文件类型
* @returns {Blob}
*/
function getBlob(buffer, format) {
    try {
        return new Blob(buffer, { type: format });
    } catch (e) {
        var bb = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder)();
        buffer.forEach(function (buf) {
            bb.append(buf);
        });
        return bb.getBlob(format);
    }
}

/**
 * 转文件流
 *
 * @param {String} basestr base64文本
 * @param {String} type 文件类型
 * @param {String} fileName 文件名
 * @returns {blob} 文件对象
 */
function toBuffer(basestr, type, fileName) {
    var text = window.atob(basestr.split(',')[1]);
    var buffer = new Uint8Array(text.length); // ,
    // pecent = 0,
    // loop = null;

    for (var i = 0; i < text.length; i++) {
        buffer[i] = text.charCodeAt(i); // 返回指定索引处字符的 Unicode
    }

    var blob = getBlob([buffer], type);
    blob.name = fileName || '';
    return blob;
}

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
function getRatio(width, height, option) {
    // 宽度压缩的倍数（水平像素数）
    var _width = width / (option.compressWidth > 0 && option.compressWidth || width) || 0;
    // 高度压缩的倍数（垂直像素数）
    var _height = height / (option.compressHeight > 0 && option.compressHeight || height) || 0;

    // 面积压缩的倍数（总像素）
    var _area = Math.sqrt(width * height / (option.compressTotal > 0 && option.compressTotal || width * height)) || 1;

    // 返回最大压缩的倍数
    return Math.max(Math.max(_width, _height) || 0, _area) || 1;
}

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
function compress(img, type, index, file, el, option) {
    // let _this = this;
    // let option = _this._options;
    var initSize = img.src.length;
    var width = img.width;
    var _width = width;
    var height = img.height;
    var _height = height;
    var ratio = 1;
    var _ratio = 0;

    //    用于压缩图片的canvas
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    //    瓦片canvas
    var tCanvas = document.createElement('canvas');
    var tctx = tCanvas.getContext('2d');

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
            ratio: ratio // 绽放的倍数
        });
    }

    canvas.width = width;
    canvas.height = height;

    //        铺底色
    ctx.fillStyle = option.compressBg || 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 如果图片像素大于100万则使用瓦片绘制
    var count = void 0;

    if ((count = width * height / (option.tile || 1000000)) > 1) {
        count = ~~(Math.sqrt(count) + 1); // 计算要分成多少块瓦片

        //            计算每块瓦片的宽和高
        var nw = ~~(width / count);
        var nh = ~~(height / count);

        tCanvas.width = nw;
        tCanvas.height = nh;

        for (var i = 0; i < count; i++) {
            for (var j = 0; j < count; j++) {
                tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);

                ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
            }
        }
    } else {
        ctx.drawImage(img, 0, 0, width, height);
    }

    // 进行最小压缩
    var ndata = canvas.toDataURL(type || 'image/png', option.encoderOptions || 0.6);

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
    tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0; // 清除画布的大小

    return ndata;
}

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
function imgFileReader(file, index, el, option, readerSuccessCallback) {
    // let _this = this;
    // let option = _this._options;
    var _ext = file.name.split('.').pop();

    // 如果图片格式不支持压缩或图片大小小于100kb，则直接上传
    if (!_ext || inArray(_ext.toLowerCase(), ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'jpe']) < 0 || !option.compressMinSize || file.size <= option.compressMinSize * 1024) {
        if (typeof readerSuccessCallback === 'function') {
            readerSuccessCallback(file, index);
        }
        return file;
    }

    var reader = new FileReader();

    reader.onload = function () {
        var result = this.result;
        var img = new Image();
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
            var data = compress(img, file.type, index, file, el, option); // 压缩图片
            data = toBuffer(data, file.type, file.name);

            if (typeof readerSuccessCallback === 'function') {
                readerSuccessCallback(data, index);
            }
            img = null;
        }
    };

    reader.readAsDataURL(file);
}

/**
 * formdata 补丁, 给不支持formdata上传blob的android机打补丁
 * @constructor
 */
function FormDataShim() {
    // console.warn('using formdata shim');

    var o = this;
    var parts = [];
    var boundary = Array(21).join('-') + (+new Date() * (1e16 * Math.random())).toString(36);
    var oldSend = XMLHttpRequest.prototype.send;

    this.append = function (name, value, filename) {
        parts.push('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"');

        if (value instanceof Blob) {
            parts.push('; filename="' + (filename || 'blob') + '"\r\nContent-Type: ' + value.type + '\r\n\r\n');
            parts.push(value);
        } else {
            parts.push('\r\n\r\n' + value);
        }
        parts.push('\r\n');
    };

    // Override XHR send()
    XMLHttpRequest.prototype.send = function (val) {
        var fr = void 0;
        var data = void 0;
        var oXHR = this;

        if (val === o) {
            // Append the final boundary string
            parts.push('--' + boundary + '--\r\n');

            // Create the blob
            data = getBlob(parts);

            // Set up and read the blob into an array to be sent
            fr = new FileReader();
            fr.onload = function () {
                oldSend.call(oXHR, fr.result);
            };
            fr.onerror = function (err) {
                throw err;
            };
            fr.readAsArrayBuffer(data);

            // Set the multipart content type and boudary
            this.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
            XMLHttpRequest.prototype.send = oldSend;
        } else {
            oldSend.call(this, val);
        }
    };
}

/**
 * 获取formdata（FormData对象兼容）
 * @returns {FormData}
 */
function getFormData() {
    var isNeedShim = ~navigator.userAgent.indexOf('Android') && ~navigator.vendor.indexOf('Google') && !~navigator.userAgent.indexOf('Chrome') && navigator.userAgent.match(/AppleWebKit\/(\d+)/).pop() <= 534;

    return isNeedShim ? new FormDataShim() : new FormData();
}

/**
 * 创建createXMLHttpRequest
 *
 * @returns {XMLHttpRequest} 返回XMLHttpRequestObject
 */
function createXMLHttpRequest() {
    var XMLHttpReq = void 0;
    try {
        XMLHttpReq = new XMLHttpRequest(); // 兼容非IE浏览器，直接创建XMLHTTP对象
    } catch (e) {
        try {
            XMLHttpReq = new ActiveXObject('Msxml2.XMLHTTP'); // IE高版本创建XMLHTTP
        } catch (e) {
            XMLHttpReq = new ActiveXObject('Microsoft.XMLHTTP'); // IE低版本创建XMLHTTP
        }
    }
    return XMLHttpReq;
}

/**
 * 合并对象
 *
 * @param {any} def 默认对象
 * @param {any} nowObj 需要合并的对象
 * @returns {Object} 返回合并后的对象
 */
function extend(def, nowObj) {
    // let _this = this;
    def = def || {};
    if (!nowObj) {
        return def;
    }
    for (var item in nowObj) {
        if (def[item] instanceof Object) {
            extend(def[item], nowObj[item]);
        } else {
            def[item] = nowObj[item];
        }
    }
    return def;
}

var config = {
    fileKey: null, // 当前绑定的key
    fileTypeExts: '*.jpg;*.png;*.gif;*.jpeg', // 允许上传的文件类型，格式'*.jpg;*.doc'
    accept: '', // 为空的时候为自动获取
    capture: '', // 调用摄像头或麦克风的类型(1、camera:拍照,accept的mime类型必须是image/*;
    // 2、camcorder:录像,accept的mime类型必须是video/*;3、microphone:录音,accept的mime类型必须是audio/*;)

    uploader: '', // 'http://kmall.kidmadeto.com/kms/videoReplyPicUpload',//文件提交的地址
    auto: true, // 是否开启自动上传
    async: true, // true为异步
    // submitUpload: true, // 是否开启自动提交
    method: 'post', // 发送请求的方式，get或post
    multi: true, // 是否允许选择多个文件
    formData: null, // 发送给服务端的参数，格式：{key1:value1,key2:value2}
    dataType: '', // 上传完成后返回的数据类型 ('' | 'json')
    fileObjName: 'file', // 在后端接受文件的参数名称，如PHP中的$_FILES['file']
    fileSizeLimit: 1024 * 10, // 允许上传的文件大小，单位KB
    showUploadedPercent: true, // 是否实时显示上传的百分比，如20%
    showUploadedSize: false, // 是否实时显示已上传的文件大小，如1M/2M
    buttonText: '选择文件', // 上传按钮上的文字
    compressWidth: 1920, // 压缩后最大宽度（0为不限）
    compressHeight: 1920, // 压缩后最大高度（0为不限）
    compressTotal: 0, // 压缩后的总像素（0为不限）
    compressMinSize: 100, // 大小大于时压缩KB
    compressBg: 'rgba(0, 0, 0, 0)', // 压缩后的背景
    encoderOptions: 0.8, // jpeg图片的压缩质量(0.0-1.0)
    tile: 1000000, // 需要使用瓦片的最小像素(瓦片大小)10万像素
    removeTimeout: 1000, // 上传完成后进度条的消失时间
    itemTemplate: '', // 上传队列显示的模板
    onReaderFile: null, // 读取文件的回调
    onUploadStart: null, // 上传开始时的回调
    onProgress: null, // 上传进度回调
    onUploadSuccess: null, // 上传成功的回调
    onUploadComplete: null, // 上传完成的回调
    onUploadError: null, // 上传失败的回调
    onCompressStart: null, // 开始压缩的回调
    onCompress: null, // 压缩完的回调
    onSizeError: null, // 文件超过大小回调
    onFileTypeError: null, // 文件类型错误回调
    onInit: null, // 初始化时的回调
    onCancel: null // 删除掉某个文件后的回调函数，可传入参数file(此功能暂时没做)
};

/**
 * 将输入的文件类型字符串转化为数组,原格式为*.jpg;*.png
 *
 * @param {String} str 文件名
 * @returns {Array<String>} 返回文件类型列表
 */
function getFileTypes(str) {
    var result = [];
    var arr1 = str.split(';');
    for (var i = 0, len = arr1.length; i < len; i++) {
        var _ext = arr1[i].split('.').pop();
        if (_ext) {
            result.push(_ext.toLowerCase());
        }
    }
    return result;
}

/**
 * 创建转换成dom元素
 *
 * @param {String} html html文本
 * @param {Object} data 数据对象
 * @returns {Node} DOM节点/元素
 */
function createNode(html, data) {
    var _cloneItem = document.createDocumentFragment();
    var _divDom = document.createElement('div');

    _cloneItem.appendChild(_divDom);
    // html = iReplaceHtmlData(html, data);
    _divDom.innerHTML = html;
    var _divDomChilds = _divDom.childNodes || [];

    for (var i = 0; i < _divDomChilds.length; i++) {
        _cloneItem.appendChild(_divDomChilds[i]);
    }
    _cloneItem.removeChild(_divDom);

    return _cloneItem;
}

/**
 * 获取MIME
 *
 * @param {any} type 文件类型
 * @returns {String}
 */
function getMime(type) {
    var res = '';
    if (!type) {
        return res;
    }
    type = (type + '').replace(/\*|\.|\s+/g, '').toLowerCase();

    switch (type) {
        case '3gpp':
            res = 'audio/3gpp,video/3gpp';
            break;
        case 'ac3':
            res = 'audio/ac3';
            break;
        case 'asf':
            res = 'allpication/vnd.ms-asf';
            break;
        case 'au':
            res = 'audio/basic';
            break;
        case 'css':
            res = 'text/css';
            break;
        case 'csv':
            res = 'text/csv';
            break;
        case 'rtf':
            res = 'application/rtf,text/rtf';
            break;
        case 'htm':
        case 'html':
            res = 'text/html';
            break;
        case 'xhtml':
            res = 'application/xhtml+xml';
            break;
        case 'js':
            res = 'text/javascript,application/javascript';
            break;
        case 'txt':
            res = 'text/plain';
            break;
        case 'xml':
            res = 'text/xml,application/xml';
            break;

        case 'dwg':
            res = 'image/vnd.dwg';
            break;
        case 'dxf':
            res = 'image/vnd.dxf';
            break;
        case 'gif':
            res = 'image/gif';
            break;
        case 'jp2':
            res = 'image/jp2';
            break;
        case 'jpe':
        case 'jpeg':
        case 'jpg':
            res = 'image/jpeg';
            break;
        case 'png':
            res = 'image/png';
            break;
        case 'svf':
            res = 'image/vnd.svf';
            break;
        case 'tif':
        case 'tiff':
            res = 'image/tiff';
            break;
    }
    return res;
    //* .doc    application/msword
    //* .dot    application/msword
    //* .dtd    application/xml-dtd
    //* .json    application/json
    //* .mp2    audio/mpeg, video/mpeg
    //* .mp3    audio/mpeg
    //* .mp4    audio/mp4, video/mp4
    //* .mpeg    video/mpeg
    //* .mpg    video/mpeg
    //* .mpp    application/vnd.ms-project
    //* .ogg    application/ogg, audio/ogg
    //* .pdf    application/pdf

    //* .pot    application/vnd.ms-powerpoint
    //* .pps    application/vnd.ms-powerpoint
    //* .ppt    application/vnd.ms-powerpoint

    //* .wdb    application/vnd.ms-works
    //* .wps    application/vnd.ms-works
    //* .xlc      application/vnd.ms-excel
    //* .xlm    application/vnd.ms-excel
    //* .xls           application/vnd.ms-excel
    //* .xlt      application/vnd.ms-excel
    //* .xlw      application/vnd.ms-excel
    //* .zip            aplication/zip
    //* .xlsx     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
}

/**
 * 获取MIME列表
 *
 * @param {any} arr 文件类型列表
 * @returns {Array<String>} 文件MIME列表
 */
function getAcceptList(arr) {
    var resArr = [];
    if (arr && arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            var _mime = getMime(arr[i]);
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

/**
 * 添加上传文件按钮
 *
 * @param {Element} el 需要添加按钮的元素
 * @param {Object} [option = config] 文件上传选项
 * @returns {Object} 返回按钮及按钮的包裹元素
 */
function createFileBtn(el, option) {
    // let _this = this;
    // let option = _this._options;
    if (!el) {
        return;
    }
    var _accept = option.accept && option.accept.split(',') || getAcceptList(getFileTypes(option.fileTypeExts)) || [];
    var _capture = '';
    // _accept = (_accept && _accept.length > 0 && _accept) || ['*'];
    if (option.capture) {
        _capture = 'capture="' + option.capture + '"';
        var _captureArr = option.capture.split(',') || [];
        if (inArray('camera', _captureArr) > -1 && inArray('image/*', _accept) < 0) {
            // 拍摄图片
            _accept.unshift('image/*');
        }
        if (inArray('camcorder', _captureArr) > -1 && inArray('video/*', _accept) < 0) {
            // 录视频
            _accept.unshift('video/*');
        }
        if (inArray('microphone', _captureArr) > -1 && inArray('audio/*', _accept) < 0) {
            // 录音频
            _accept.unshift('audio/*');
        }
    }
    _accept = _accept.length > 0 ? _accept.join(',') : '*';

    var fileFrag = createNode('<div style="display:inline-block;position: absolute;top: 0;left: 0;width: 100%;height: 100%;overflow: hidden;">\n                <span class="_select-btn-text_" style="display:inline-block;width:100%;line-height:50px;text-align:center;font-size: 12px;color:#999999;">' + option.buttonText + '</span>\n                <input class="_select-file-btn_"\n                style="display:block;position: absolute;top: 0;left: 0;width: 100%;height: 100%;font-size: 1000000px;filter: alpha(opacity=0);opacity: 0;"\n                ' + (option.multi ? ' multiple' : '') + '\n                type="file" name="fileselect" accept="' + _accept + '" ' + _capture + '>\n            </div>');
    var fileBtn = fileFrag.querySelectorAll('input');
    var btnWrap = fileFrag.querySelectorAll('div');
    el.style.position = 'relative';
    el.appendChild(fileFrag);

    return {
        fileInputWrap: btnWrap && btnWrap[0] || null,
        fileInput: fileBtn && fileBtn[0] || null
    };
}

/**
 * 将文件的单位由bytes转换为KB或MB
 *
 * @param {Number} size 文件的大小（bit）
 * @param {Boolean} byKB 指定为true，则永远转换为KB
 * @returns {Number}
 */
function formatFileSize(size, byKB) {
    if (size > 1024 * 1024 && !byKB) {
        size = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
    } else {
        size = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';
    }
    return size;
}

/**
 * 过滤文件
 *
 * @param {Array<Flie>} files 文件列表
 * @param {HTMLElement} el 绑定的元素
 * @param {Object} [option = config] 文件上传选项
 * @returns {Array<Flie>} 返回可用符合条件的文件列表
 */
function filtFilter(files, el, option) {
    // let _this = this;
    var arr = [];
    // let option = _this._options;
    var typeArray = getFileTypes(option.fileTypeExts);
    if (typeArray.length > 0) {
        for (var i = 0, len = files.length; i < len; i++) {
            var thisFile = files[i];

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
                        size: formatFileSize(thisFile.size, true) // 当前文件大小
                    });
                }
                continue;
            }
            if (inArray(thisFile.name.split('.').pop(), typeArray) >= 0) {
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
                        typeArray: typeArray // 所支持的类型
                    });
                }
                // alert('文件' + thisFile.name + '类型不允许！');
            }
        }
    }
    return arr;
}

/**
 * 文件上传插件
 * @class
 * @alias FileUpload
 * @param {Element} el 上传按钮放置的元素
 * @param {Object} opts 配置选项
 */
function FileUpload(el, opts) {
    if (!el) {
        return;
    }
    this._el = el;
    var _options = this._options = extend(config, opts);
    _options.el = el;
    this._ongoingIndex = -1; // 正在上传的索引
    this._init();
}

FileUpload.prototype = {
    _init: function _init() {
        var _this = this;
        var option = _this._options;
        var _el = _this._el;
        _this._files = null;
        var _fileObj = _this._fileObj = createFileBtn(_el, option) || {};
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
    _funUploadFile: function _funUploadFile(file, index, fileCount, onUploadComplete) {
        var _this = this;
        var xhr = createXMLHttpRequest() || false;
        var option = _this._options;
        var el = _this._el;
        var _total = 0;

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
                        var _data = xhr.responseText;
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
            var fd = getFormData(); // new FormData();

            if (file.name) {
                fd.append(option.fileObjName, file, file.name);
            } else {
                fd.append(option.fileObjName, file);
            }

            if (option.formData) {
                for (var key in option.formData) {
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
    delFile: function delFile(index) {
        var _this = this;
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
    _funGetFiles: function _funGetFiles(e) {
        var _this = this;
        var option = _this._options;
        // 获取文件列表对象
        var files = e.target.files;
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
        if (option.auto) {
            // 判断是否是自动上传
            _this.submitUpload();
        }
    },

    /**
     * 提交上传
     */
    submitUpload: function submitUpload() {
        var _this = this;
        var option = _this._options;
        var _fileObj = _this._fileObj;

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
                    _this._execUpload(_file, _i, _len, function (data, xhr) {
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
    _execUpload: function _execUpload(file, index, fileCount, onUploadComplete) {
        var _this = this;
        var option = _this._options;
        try {
            imgFileReader(file, index, _this._el, option, function (_file, _index) {
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
    _onProgress: function _onProgress(index, file, loaded, total) {
        var _this = this;
        var option = _this._options;
        if (typeof option.onProgress === 'function') {
            option.onProgress({
                el: _this._el,
                fileKey: option.fileKey,
                index: index,
                file: file,
                loaded: loaded, // 表示当前加载了多少字节流
                total: total // 表示总共有多少字节流
            });
        }
    }
};

exports.FileUpload = FileUpload;

Object.defineProperty(exports, '__esModule', { value: true });

})));
