export declare class FileUpload {
    constructor(el:HTMLElement,options:IFileUploadOption);
}


export declare interface IFileUploadOption{
    fileTypeExts?: stirng; // 允许上传的文件类型，格式'*.jpg;*.doc'
    uploader:  stirng;//文件提交的地址
    auto?: boolean; // 是否开启自动上传
    async?: boolean; // true为异步
    submitUpload?: boolean; // 是否开启自动提交
    method?: 'post'; // 发送请求的方式，get或post
    multi?: boolean; // 是否允许选择多个文件
    formData?: IFormData, // 除文件以外发送给服务端的参数，格式：{key1:value1,key2:value2}
    dataType?:  stirng;//上传完成后返回的数据类型
    fileObjName?:  stirng; // 在后端接受文件的参数名称，如PHP中的$_FILES['file']
    fileSizeLimit?: number; // 允许上传的文件大小，单位KB
    showUploadedPercent?: boolean; // 是否实时显示上传的百分比，如20%
    showUploadedSize?: boolean; // 是否实时显示已上传的文件大小，如1M/2M
    buttonText?:  stirng; // 上传按钮上的文字
    compressWidth?: number; // 压缩后最大宽度（0为不限）
    compressHeight?: number; // 压缩后最大高度（0为不限）
    compressTotal?: number; // 压缩后的总像素（0为不限）
    compressMinSize?: number; // 大小大于时压缩KB
    compressBg?:  stirng; // 压缩后的背景
    encoderOptions?: number; // jpeg图片的压缩质量(0.0-1.0)
    tile?:  number; // 需要使用瓦片的最小像素(瓦片大小)10万像素
    removeTimeout?:  number; // 上传完成后进度条的消失时间
    itemTemplate?:  stirng; // 上传队列显示的模板
    onReaderFile?: IReaderFileBack; // 读取文件的回调
    onUploadStart?: null, // 上传开始时的回调
    onProgress?: null, // 上传进度回调
    onUploadSuccess?: null, // 上传成功的回调
    onUploadComplete?: null, // 上传完成的回调
    onUploadError?: null, // 上传失败的回调
    onCompressStart?: null, // 开始压缩的回调
    onCompress?: null, // 压缩完的回调
    onSizeError?: null, // 文件超过大小回调
    onFileTypeError?: null, // 文件类型错误回调
    onInit?: null, // 初始化时的回调
    onCancel?: null// 删除掉某个文件后的回调函数，可传入参数file(此功能暂时没做)
}

interface IFormData{
    [key:string]:any
}

interface backParams{//回调的参数
    files:File
}

interface IReaderFileBack{//读取文件的回调
    (params:backParams):void;
}