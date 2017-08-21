var FileUpload = (function () {
    function _Upload(el, opts) {
        if (!el) {
            return;
        }
        this._el = el;
        var itemTemp = '';
        var defaults = {
            fileTypeExts: '*.jpg;*.png;*.gif;*.jpeg', // 允许上传的文件类型，格式'*.jpg;*.doc'
            uploader: '', // 'http://kmall.kidmadeto.com/kms/videoReplyPicUpload',//文件提交的地址
            auto: true, // 是否开启自动上传
            async: true, // true为异步
            submitUpload: true, // 是否开启自动提交
            method: 'post', // 发送请求的方式，get或post
            multi: true, // 是否允许选择多个文件
            formData: null, // 发送给服务端的参数，格式：{key1:value1,key2:value2}
            dataType: '',
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
            itemTemplate: itemTemp, // 上传队列显示的模板
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
            onCancel: null// 删除掉某个文件后的回调函数，可传入参数file(此功能暂时没做)
        };
        var _options = this._options = extend(defaults, opts);
        _options.el = el;
        this._init();
    }

    _Upload.prototype = {
        _init: function () {
            var _this = this,
                option = _this._options,
                _el = _this._el;
            _this._files = null;
            var _fileObj = _this._fileObj = _this._addFileBtn(_el) || {};
            // _fileObj.fileFilter = [];//过滤后的文件数组
            _fileObj.fileInput && _fileObj.fileInput.addEventListener('change', function (e) {
                _this._funGetFiles(e);
            });
            if (option.onInit && option.onInit instanceof Function) {
                option.onInit && option.onInit(_el);
            }
        },

        /**
         * 读取图片文件
         */
        _fileReader: function (file, index) {
            var _this = this,
                option = _this._options,
                _ext = file.name.split('.').pop();

            // 如果图片格式不支持压缩或图片大小小于100kb，则直接上传
            if (!_ext || _this._inArray(_ext.toLowerCase(), ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'jpe']) < 0 || !option.compressMinSize || file.size <= option.compressMinSize * 1024) {
                _this._funUploadFile(file, index);
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

                function callback() {
                    var data = _this._compress(img, file.type, index);// 压缩图片
                    data = _this._toBuffer(data, file.type, file.name);

                    _this._funUploadFile(data, index);

                    img = null;
                }
            };

            reader.readAsDataURL(file);
        },
        /**
         * 添加上传文件按钮
         */
        _addFileBtn: function (el) {
            var _this = this,
                option = _this._options;
            if (!el) {
                return;
            }
            var _accept = getMimeList(getFileTypes(option.fileTypeExts));
            _accept = _accept && _accept.join(',') || '*';

            var fileFrag = createNode(`<div style="display:inline-block;position: absolute;top: 0;left: 0;width: 100%;height: 100%;overflow: hidden;">
                    <span class="_select-btn-text_" style="display:inline-block;width:100%;line-height:50px;text-align:center;font-size: 12px;color:#999999;">${option.buttonText}</span>
                    <input class="_select-file-btn_"
                    style="display:block;position: absolute;top: 0;left: 0;width: 100%;height: 100%;font-size: 1000000px;filter: alpha(opacity=0);opacity: 0;"
                    ${option.multi ? ' multiple' : ''}
                    type="file" name="fileselect" accept="${_accept}">
                </div>`),
                fileBtn = fileFrag.querySelectorAll('input'),
                btnWrap = fileFrag.querySelectorAll('div');
            el.style.position = 'relative';
            el.appendChild(fileFrag);

            return {
                fileInputWrap: btnWrap && btnWrap[0] || null,
                fileInput: fileBtn && fileBtn[0] || null
            };
        },
        /**
         * 过滤文件
         */
        _filter: function (files) {
            var _this = this,
                arr = [],
                option = _this._options,
                typeArray = getFileTypes(option.fileTypeExts);
            if (typeArray.length > 0) {
                for (var i = 0, len = files.length; i < len; i++) {
                    var thisFile = files[i];

                    if (parseInt(formatFileSize(thisFile.size, true)) > option.fileSizeLimit) {
                        // alert('文件' + thisFile.name + '大小超出限制！');
                        if (option.onSizeError instanceof Function) {
                            option.onSizeError({
                                fileName: thisFile.name, // 文件名
                                file: thisFile, // 文件
                                maxSize: formatFileSize(option.fileSizeLimit * 1024 || 0, true), // 限制的最大大小
                                size: formatFileSize(thisFile.size, true)// 当前文件大小
                            });
                        }
                        continue;
                    }
                    if (_this._inArray(thisFile.name.split('.').pop(), typeArray) >= 0) {
                        arr.push(thisFile);
                    } else {
                        if (option.onFileTypeError && option.onFileTypeError instanceof Function) {
                            option.onFileTypeError({
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
        },

        /**
         * 对比数组中的值
         */
        _inArray: function (item, arr) {
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
        },
        // 获取选择文件，file控件
        _funGetFiles: function (e) {
            var _this = this,
                option = _this._options,
                _fileObj = _this._fileObj;
            // 获取文件列表对象
            var files = e.target.files;

            if (option.onReaderFile instanceof Function) {
                option.onReaderFile({
                    files: files
                });
            }

            // 过滤文件
            files = _this._filter(files);

            // for (var i = 0, len = files.length; i < len; i++) {
            //    _fileObj.fileFilter.push(files[i]);
            // }
            _this._files = files;
            _this.submitUpload();
        },

        /**
         * 提交上传
         */
        submitUpload: function () {
            var _this = this,
                files = _this._files,
                option = _this._options;

            for (var i = 0, len = files.length; i < len; i++) {
                var file = files[i];
                // 判断是否是自动上传
                if (option.auto) {
                    _this._execUpload(file, i);
                    _this._files = null;
                } else {
                    // 如果配置非自动上传，绑定上传事件
                    // $html.find('.uploadbtn').on('click', (function (file) {
                    //    return function () { fileObj.funUploadFile(file); }
                    // })(file));
                }
            }
        },

        /**
         * 执行上传
         */
        _execUpload: function (file, index) {
            var _this = this;
            try {
                _this._fileReader(file, index);
            } catch (e) {
                _this._funUploadFile(file, index);
            }
        },

        //    使用canvas对大图片进行压缩
        _getRatio: function(width, height, option) {
            return Math.max(Math.max((width / (option.compressWidth > 0 && option.compressWidth || width)) || 0, (height / (option.compressHeight > 0 && option.compressHeight || height)) || 0) || 0, Math.sqrt(width * height / (option.compressTotal > 0 && option.compressTotal || width * height)) || 1) || 1;
        },
        _compress: function (img, type, index) {
            var _this = this,
                option = _this._options,
                initSize = img.src.length,
                _width = width = img.width,
                _height = height = img.height,
                ratio = 1,
                _ratio = 0;

            //    用于压缩图片的canvas
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d');

            //    瓦片canvas
            var tCanvas = document.createElement('canvas'),
                tctx = tCanvas.getContext('2d');

            _ratio = _this._getRatio(_width, _height, option);

            // 计算图片压缩后的大小
            if (_ratio > 1) {
                ratio = _ratio;
                width /= ratio;
                height /= ratio;
            }

            if (option.onCompressStart && option.onCompressStart instanceof Function) {
                option.onCompressStart({
                    index: index, // 文件索引
                    // base64Data: img.src,//文件内容
                    size: initSize, // 压缩前大小
                    width: _width, // 压缩前的宽度
                    height: _height, // 压缩前的高度
                    compressWidth: width, // 压缩前的宽度
                    compressHeight: height, // 压缩前的高度
                    ratio: ratio// 绽放的倍数
                });
            }

            canvas.width = width;
            canvas.height = height;

            //        铺底色
            ctx.fillStyle = option.compressBg || 'rgba(255, 255, 255, 0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 如果图片像素大于100万则使用瓦片绘制
            var count;

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
                    index: index, // 文件索引
                    // base64Data:ndata,//文件内容
                    initSize: initSize, // 压缩前大小
                    size: ndata.length, // 压缩后大小
                    ratio: ~~(100 * (initSize - ndata.length) / initSize) + '%', // 压缩率
                    initWidth: _width, // 压缩前的宽度
                    initHeight: _height, // 压缩前的高度
                    width: width, // 压缩前的宽度
                    height: height // 压缩前的高度
                });
            }
            tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;// 清除画布的大小

            return ndata;
        },
        /**
         * 转文件流
         * @param {String} basestr base64文本
         * @param {String} type 文件类型
         */
        _toBuffer: function (basestr, type, fileName) {
            var text = window.atob(basestr.split(',')[1]),
                buffer = new Uint8Array(text.length),
                pecent = 0, loop = null;

            for (var i = 0; i < text.length; i++) {
                buffer[i] = text.charCodeAt(i);
            }

            var blob = getBlob([buffer], type);
            blob.name = fileName || '';
            return blob;
        },
        _onProgress: function (index, file, loaded, total) {
            var _this = this,
                option = _this._options;
            if (option.onProgress && option.onProgress instanceof Function) {
                option.onProgress({
                    index: index,
                    file: file,
                    loaded: loaded,
                    total: total
                });
            }
            // var eleProgress = _this.find('#fileupload_' + instanceNumber + '_' + file.index + ' .uploadify-progress');
            // var percent = (loaded / total * 100).toFixed(2) + '%';
            // if (option.showUploadedSize) {
            //    eleProgress.nextAll('.progressnum .uploadedsize').text(formatFileSize(loaded));
            //    eleProgress.nextAll('.progressnum .totalsize').text(formatFileSize(total));
            // }
            // if (option.showUploadedPercent) {
            //    eleProgress.nextAll('.up_percent').text(percent);
            // }
            // eleProgress.children('.uploadify-progress-bar').css('width', percent);
        },		// 文件上传进度
        // 文件上传
        _funUploadFile: function (file, index) {
            var _this = this,
                xhr = createXMLHttpRequest() || false,
                option = _this._options,
                _fileObj = _this._fileObj;
            _this._files = null;

            if (xhr && xhr.upload) {
                // 上传中
                xhr.upload.addEventListener('progress', function (e) {
                    _this._onProgress(index, file, e.loaded, e.total);
                }, false);

                // 文件上传成功或是失败
                xhr.onreadystatechange = function (e) {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            // 校正进度条和上传比例的误差
                            // var thisfile = _this.find('#fileupload_' + instanceNumber + '_' + file.index);
                            // thisfile.find('.uploadify-progress-bar').css('width', '100%');
                            // option.showUploadedSize && thisfile.find('.uploadedsize').text(thisfile.find('.totalsize').text());
                            // option.showUploadedPercent && thisfile.find('.up_percent').text('100%');
                            var _data = xhr.responseText;
                            if (option.dataType == 'json') {
                                _data = JSON.parse(xhr.responseText);
                            }
                            option.onUploadSuccess && option.onUploadSuccess(file, _data, index);
                            /// /在指定的间隔时间后删掉进度条
                            // setTimeout(function () {
                            //    _this.find('#fileupload_' + instanceNumber + '_' + file.index).fadeOut();
                            // }, option.removeTimeout);
                        } else {
                            option.onUploadError && option.onUploadError(file, xhr.responseText, index);
                        }
                        option.onUploadComplete && option.onUploadComplete(file, xhr.responseText, index);
                        // 清除文件选择框中的已有值
                        _fileObj.fileInput.value = '';
                    }
                };

                option.onUploadStart && option.onUploadStart({
                    file: file,
                    index: index,
                    fileName: file.name
                });
                // 开始上传
                xhr.open(option.method, option.uploader, option.async || true);
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                var fd = getFormData();// new FormData();

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
        }
    };

    return _Upload;

    /**
     * 创建createXMLHttpRequest
     *
     * @returns XMLHttpRequestObject
     */
    function createXMLHttpRequest() {
        var XMLHttpReq;
        try {
            XMLHttpReq = new XMLHttpRequest();// 兼容非IE浏览器，直接创建XMLHTTP对象
        }catch (e) {
            try {
                XMLHttpReq = new ActiveXObject('Msxml2.XMLHTTP');// IE高版本创建XMLHTTP
            } catch(e) {
                XMLHttpReq = new ActiveXObject('Microsoft.XMLHTTP');// IE低版本创建XMLHTTP
            }
        }
        return XMLHttpReq;
    }

    /**
  * 获取blob对象的兼容性写法
  * @param buffer
  * @param format
  * @returns {*}
  */
    function getBlob(buffer, format) {
        try {
            return new Blob(buffer, { type: format});
        } catch (e) {
            var bb = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder)();
            buffer.forEach(function (buf) {
                bb.append(buf);
            });
            return bb.getBlob(format);
        }
    }

    /**
   * 获取formdata
   */
    function getFormData() {
        var isNeedShim = ~navigator.userAgent.indexOf('Android') &&
            ~navigator.vendor.indexOf('Google') &&
            !~navigator.userAgent.indexOf('Chrome') &&
            navigator.userAgent.match(/AppleWebKit\/(\d+)/).pop() <= 534;

        return isNeedShim ? new FormDataShim() : new FormData();
    }

    /**
     * formdata 补丁, 给不支持formdata上传blob的android机打补丁
     * @constructor
     */
    function FormDataShim() {
        // console.warn('using formdata shim');

        var o = this,
            parts = [],
            boundary = Array(21).join('-') + (+new Date() * (1e16 * Math.random())).toString(36),
            oldSend = XMLHttpRequest.prototype.send;

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
            var fr,
                data,
                oXHR = this;

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
     * 创建转换成dom元素
     *
     * @param {String} html html文本
     * @param {Object} itemData 数据对象
     * @returns {Node} DOM节点/元素
     */
    function createNode(html, data) {
        var _cloneItem = document.createDocumentFragment(),
            _divDom = document.createElement('div');

        _cloneItem.appendChild(_divDom);
        // html = iReplaceHtmlData(html, data);
        _divDom.innerHTML = html;
        _divDomChilds = _divDom.childNodes || [];

        for (var i = 0; i < _divDomChilds.length; i++) {
            _cloneItem.appendChild(_divDomChilds[i]);
        }
        _cloneItem.removeChild(_divDom);

        return _cloneItem;
    }

    /**
    * 合并对象
    */
    function extend(def, nowObj) {
        var _this = this;
        def = def || {};
        if (!nowObj) {
            return def;
        }
        for (var item in nowObj) {
            if (def[item] instanceof Object) {
                _this._extend(def[item], nowObj[item]);
            } else {
                def[item] = nowObj[item];
            }
        }
        return def;
    }

    // 将文件的单位由bytes转换为KB或MB，若第二个参数指定为true，则永远转换为KB
    function formatFileSize(size, byKB) {
        if (size > 1024 * 1024 && !byKB) {
            size = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
        } else {
            size = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';
        }
        return size;
    }

    // 根据文件序号获取文件
    function getFile(index, files) {
        for (var i = 0; i < files.length; i++) {
            if (files[i].index == index) {
                return files[i];
            }
        }
        return false;
    }

    // 将输入的文件类型字符串转化为数组,原格式为*.jpg;*.png
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
     * 获取MIME列表
     */
    function getMimeList(arr) {
        var resArr = [];
        if (arr && arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                var _mime = getMime(arr[i]);
                if (_mime) {
                    resArr.push(_mime);
                }
            }
        }
        if (resArr.length <= 0) {
            resArr.push('*');
        }
        return resArr;
    }

    /**
     * 获取MIME
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
})();