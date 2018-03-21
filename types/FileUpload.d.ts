export declare class FileUpload {
    /**
     * 文件上传插件
     * @param {HTMLElement} el 绑定上传的节点
     * @param {IFileUploadOption} options 上传时的配置选项
     * @memberof FileUpload
     */
    constructor(el:HTMLElement,options:IFileUploadOption);
}


export declare interface IFileUploadOption{
    fileKey?:any;//当前绑定的KEY
    fileTypeExts?: string; // 允许上传的文件类型，格式'*.jpg;*.doc'
    accept?: string; // 为空的时候为自动按fileTypeExts(文件扩展名)获取
    capture?: 'camera'|'camcorder'|'microphone'|'camera,camcorder'|'camera,microphone'|'camcorder,microphone'|'camera,camcorder,microphone'; // 调用摄像头或麦克风的类型(1、camera:拍照,accept的mime类型必须是image/*;
                                                 //2、camcorder:录像,accept的mime类型必须是video/*;3、microphone:录音,accept的mime类型必须是audio/*;)
    uploader:  string;//文件提交的地址
    auto?: boolean; // 是否开启自动上传
    async?: boolean; // true为异步
    // submitUpload?: boolean; // 是否开启自动提交
    method?: 'post'; // 发送请求的方式，get或post
    multi?: boolean; // 是否允许选择多个文件
    formData?: IFileUploadFormData, // 除文件以外发送给服务端的参数，格式：{key1:value1,key2:value2}
    dataType?:  '' | 'json';//上传完成后返回的数据类型
    fileObjName?:  string; // 在后端接受文件的参数名称，如PHP中的$_FILES['file']
    fileSizeLimit?: number; // 允许上传的文件大小，单位KB
    showUploadedPercent?: boolean; // 是否实时显示上传的百分比，如20%
    showUploadedSize?: boolean; // 是否实时显示已上传的文件大小，如1M/2M
    buttonText?:  string; // 上传按钮上的文字
    compressWidth?: number; // 压缩后最大宽度（0为不限）
    compressHeight?: number; // 压缩后最大高度（0为不限）
    compressTotal?: number; // 压缩后的总像素（0为不限）
    compressMinSize?: number; // 大小大于时压缩KB
    compressBg?:  string; // 压缩后的背景
    encoderOptions?: number; // jpeg图片的压缩质量(0.0-1.0)
    tile?:  number; // 需要使用瓦片的最小像素(瓦片大小)10万像素
    removeTimeout?:  number; // 上传完成后进度条的消失时间
    itemTemplate?:  string; // 上传队列显示的模板(此功能暂时没做)
    onReaderFile?: IFileUploadBack<IBaseBackParams>; // 读取文件的回调
    onUploadStart?: IFileUploadBack<IUploadStartBackParams>; // 上传开始时的回调
    onProgress?: IFileUploadBack<IProgressBackParams>; // 上传进度回调
    onUploadSuccess?: IFileUploadEndBack<IBackParams,any>; // 上传成功的回调
    onUploadComplete?: IFileUploadEndBack<IBackParams,XMLHttpRequest>; // 上传完成的回调
    onUploadError?: IFileUploadEndBack<IBackParams,XMLHttpRequest>; // 上传失败的回调
    onCompressStart?:IFileUploadBack<ICompressStartBackParams>; // 开始压缩的回调
    onCompress?: IFileUploadBack<ICompressBackParams>; // 压缩完的回调
    onSizeError?: IFileUploadBack<ISizeErrorParams>; // 文件超过大小回调
    onFileTypeError?: IFileUploadBack<IFileTypeErrorParams>; // 文件类型错误回调
    onInit?: IFileUploadBack<IInitParams>, // 初始化时的回调
    onCancel?: null// 删除掉某个文件后的回调函数，可传入参数file(此功能暂时没做)
}
/**
 * 除文件以外发送给服务端的参数
 *
 * @interface IFormData
 */
export declare interface IFileUploadFormData{
    [key:string]:any
}



/**
 * 读取文件的回调
 *
 * @interface IReaderFileBack
 */
interface IFileUploadBack<T>{
    (params:T):void;
}

/**
 * 读取文件的回调
 *
 * @interface IReaderFileBack
 */
interface IFileUploadEndBack<T,D>{
    (params:T,data:D):void;
}

/**
 * 回调的参数
 *
 * @interface backParams
 */
interface IInitParams{
    el:HTMLElement;//当前绑定上传的节点,
    fileKey:any;//当前绑定的key
}

/**
 * 回调的参数
 *
 * @interface backParams
 */
interface IBaseBackParams extends IInitParams{
    files:File;//文件
}

interface IBackParams extends IBaseBackParams{
    index: number;//当前上传文件的索引
    fileCount: number; // 文件数量
}

/**
 * 开始上传的回调参数
 *
 * @interface IUploadStart
 * @extends {IBackParams}
 */
interface IUploadStartBackParams extends IBackParams{
    fileName: string;//文件名称
}

/**
 * 文件上传进度回调参数
 *
 * @interface IProgressParams
 * @extends {IBackParams}
 */
interface IProgressBackParams extends IBackParams{
    loaded: number; // 表示当前加载了多少字节流
    total: number;// 表示总共有多少字节流
}

/**
 * 压缩前的回调数据
 *
 * @interface ICompressStartBackParams
 * @extends {IBackParams}
 */
interface ICompressStartBackParams extends IBackParams{
    size: number; // 压缩前大小
    width: number; // 压缩前的宽度
    height: number; // 压缩前的高度
    compressWidth: number; // 压缩后的宽度
    compressHeight: number; // 压缩后的高度
    ratio: number|string;// 绽放的倍数｜压缩率
}

/**
 * 压缩完成后的回调数据
 *
 * @interface ICompressBackParams
 * @extends {ICompressStartBackParams}
 */
interface ICompressBackParams extends ICompressStartBackParams{
    base64Data:string;//文件base64内容
    currentSize: number; // 压缩后大小
}
/**
 * 文件超过限制大小的回调数据
 *
 * @interface ICompressBackParams
 * @extends {IUploadStartBackParams}
 */
interface ISizeErrorParams extends IUploadStartBackParams{
    maxSize: number; // 限制的最大值
    size: number; // 当前文件大小
}

/**
 * 文件类型错误的回调数据
 *
 * @interface ICompressBackParams
 * @extends {IUploadStartBackParams}
 */
interface IFileTypeErrorParams extends IUploadStartBackParams{
    type: string; // 当前文件类型
    typeArray: string[];// 所支持的类型列表
}