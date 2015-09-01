# uploader

## 简单的html5上传：

* 支持预览
* 多文件上传
* 进度条
* 

## 使用
```
<link href="assets/css/uploader.css" rel="stylesheet">
<script src="assets/lib/jquery.min.js"></script>
<script src="assets/js/uploader.js"></script>
$(function() {
    var uploader = new Uploader({
        selector: $('#upload-zone'),
        multiple: true,
        accept: 'image/*',
        ajax: {
            url: 'server/upload.php',
            data: {id: 12, type: 1},
            callback: function(json) {
                console.log(json);
            }
        },
        language: {
            hint: 'Click to upload',
            cancel: 'Cancel',
            clear: 'Clear',
            upload: 'Upload',
            add: 'Add'
        }
    });
    uploader.init();
});
```

## 预览
![img](demo.gif)
