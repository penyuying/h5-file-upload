
import {getBlob} from './getBlob';
/**
 * formdata 补丁, 给不支持formdata上传blob的android机打补丁
 * @constructor
 */
export function FormDataShim() {
    // console.warn('using formdata shim');

    let o = this;
    let parts = [];
    let boundary = Array(21).join('-') + (+new Date() * (1e16 * Math.random())).toString(36);
    let oldSend = XMLHttpRequest.prototype.send;

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
        let fr;
        let data;
        let oXHR = this;

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