import { FormDataShim } from './FormDataShim';
/**
 * 获取formdata（FormData对象兼容）
 * @returns {FormData}
 */
export function getFormData() {
    let isNeedShim = ~navigator.userAgent.indexOf('Android') &&
        ~navigator.vendor.indexOf('Google') &&
        !~navigator.userAgent.indexOf('Chrome') &&
        navigator.userAgent.match(/AppleWebKit\/(\d+)/).pop() <= 534;

    return isNeedShim ? new FormDataShim() : new FormData();
}