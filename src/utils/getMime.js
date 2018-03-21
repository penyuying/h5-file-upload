/**
 * 获取MIME
 *
 * @param {any} type 文件类型
 * @returns {String}
 */
export function getMime(type) {
    let res = '';
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