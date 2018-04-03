export const config = {
    fileKey: null, // 当前绑定的key
    fileTypeExts: '*', // '*.jpg;*.png;*.gif;*.jpeg'允许上传的文件类型，格式'*.jpg;*.doc'
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
    onCancel: null// 删除掉某个文件后的回调函数，可传入参数file(此功能暂时没做)
};