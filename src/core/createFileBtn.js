import { inArray } from '../utils/inArray';
import { getFileTypes } from '../utils/getFileTypes';
import { createNode } from '../utils/createNode';
import { getAcceptList } from './getAcceptList';
/**
 * 添加上传文件按钮
 *
 * @param {Element} el 需要添加按钮的元素
 * @param {Object} [option = config] 文件上传选项
 * @returns {Object} 返回按钮及按钮的包裹元素
 */
export function createFileBtn(el, option) {
    // let _this = this;
    // let option = _this._options;
    if (!el) {
        return;
    }
    let _accept = (option.accept && option.accept.split(',')) || getAcceptList(getFileTypes(option.fileTypeExts)) || [];
    let _capture = '';
    // _accept = (_accept && _accept.length > 0 && _accept) || ['*'];
    if (option.capture) {
        _capture = `capture="${option.capture}"`;
        let _captureArr = option.capture.split(',') || [];
        if (inArray('camera', _captureArr) > -1 && inArray('image/*', _accept) < 0) { // 拍摄图片
            _accept.unshift('image/*');
        }
        if (inArray('camcorder', _captureArr) > -1 && inArray('video/*', _accept) < 0) { // 录视频
            _accept.unshift('video/*');
        }
        if (inArray('microphone', _captureArr) > -1 && inArray('audio/*', _accept) < 0) { // 录音频
            _accept.unshift('audio/*');
        }
    }
    _accept = _accept.length > 0 ? _accept.join(',') : '*';

    let fileFrag = createNode(`<div style="display:inline-block;position: absolute;top: 0;left: 0;width: 100%;height: 100%;overflow: hidden;">
                <span class="_select-btn-text_" style="display:inline-block;width:100%;line-height:50px;text-align:center;font-size: 12px;color:#999999;">${option.buttonText}</span>
                <input class="_select-file-btn_"
                style="display:block;position: absolute;top: 0;left: 0;width: 100%;height: 100%;font-size: 1000000px;filter: alpha(opacity=0);opacity: 0;"
                ${option.multi ? ' multiple' : ''}
                type="file" name="fileselect" accept="${_accept}" ${_capture}>
            </div>`);
    let fileBtn = fileFrag.querySelectorAll('input');
    let btnWrap = fileFrag.querySelectorAll('div');
    el.style.position = 'relative';
    el.appendChild(fileFrag);

    return {
        fileInputWrap: (btnWrap && btnWrap[0]) || null,
        fileInput: (fileBtn && fileBtn[0]) || null
    };
}