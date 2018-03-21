/**
 * 创建createXMLHttpRequest
 *
 * @returns {XMLHttpRequest} 返回XMLHttpRequestObject
 */
export function createXMLHttpRequest() {
    let XMLHttpReq;
    try {
        XMLHttpReq = new XMLHttpRequest();// 兼容非IE浏览器，直接创建XMLHTTP对象
    } catch (e) {
        try {
            XMLHttpReq = new ActiveXObject('Msxml2.XMLHTTP');// IE高版本创建XMLHTTP
        } catch (e) {
            XMLHttpReq = new ActiveXObject('Microsoft.XMLHTTP');// IE低版本创建XMLHTTP
        }
    }
    return XMLHttpReq;
}