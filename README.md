# uploader

## 简单的html5上传：

* 支持预览
* 多文件上传
* 进度条

## 使用
```
<link href="assets/css/uploader.css" rel="stylesheet">
<script src="assets/lib/jquery.min.js"></script>
<script src="assets/js/uploader.js"></script>
$(function() {
    var uploader = new Uploader({
        selector: $('#upload-zone'),    // upload区域
        multiple: true,                 // 是否支持多文件
        accept: 'image/*',              // 文件类型
        ajax: {
            url: 'server/upload.php',   // 上传地址
            data: {id: 12, type: 1},    // 上传附加参数
            callback: function(json) {  // 成功后的回调
                console.log(json);
            }
        },
        language: {
            hint: 'Click to upload',    // 点击文字提示
            clear: 'Clear',             // 清空文字
            upload: 'Upload',           // 上传文字
            add: 'Add'                  // 添加文字
        }
    });
    uploader.init();
});
```

## 预览
![img](demo.gif)
