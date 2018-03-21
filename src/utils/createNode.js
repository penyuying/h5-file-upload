/**
 * 创建转换成dom元素
 *
 * @param {String} html html文本
 * @param {Object} data 数据对象
 * @returns {Node} DOM节点/元素
 */
export function createNode(html, data) {
    let _cloneItem = document.createDocumentFragment();
    let _divDom = document.createElement('div');

    _cloneItem.appendChild(_divDom);
    // html = iReplaceHtmlData(html, data);
    _divDom.innerHTML = html;
    let _divDomChilds = _divDom.childNodes || [];

    for (let i = 0; i < _divDomChilds.length; i++) {
        _cloneItem.appendChild(_divDomChilds[i]);
    }
    _cloneItem.removeChild(_divDom);

    return _cloneItem;
}