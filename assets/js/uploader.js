/**
 * Created by zhaobao on 8/30/15.
 */

(function (root, factory) {
    var uploader = {};
    factory(uploader);
    if (typeof define === "function" && define.amd) {
        define(uploader.factory);
    } else {
        root.Uploader = uploader.factory;
    }
})(this, function (uploader) {

    var T = {
        sprintf: function(str) {
            var args = arguments;
            return str.replace(/{(\d+)}/g, function() {
                var index = arguments[1];
                return args[index]
            });
        },
        generateUuid: function() {
            return (10000 * Math.random()).toFixed();
        },
        disableBtn: function($btn) {
            $btn.attr('disabled', 'disabled');
        },
        enableBtn: function($btn) {
            $btn.removeAttr('disabled')
        }
    };

    var Uploader = function(options) {
        this.options = $.extend({}, Uploader.defaults, options);
        this.files = [];
        this.ready = false;
    };

    Uploader.TYPE = {
        IMG: 'img'
    };

    Uploader.TEMPLATE = {
        WRAPPER:
        '<div class="uploader-wrapper">' +
        '<div class="uploader-body">' +
        '<div class="uploader-hint">{1}</div>' +
        '<div class="uploader-item uploader-hide"></div>' +
        '</div>' +
        '<div class="uploader-footer">' +
        '<button class="btn-success uploader-do">{2}</button>' +
        '<button class="btn-warning uploader-cancel-all">{3}</button>' +
        '<button class="btn-warning uploader-add">{4}</button>' +
        '</div>' +
        '</div>',
        PREVIEW:
        '<div class="preview-wrapper preview-{1}" data-do="ready">' +
        '<div class="preview-item"></div>' +
        '<div class="preview-overlay uploader-full uploader-hide"></div>' +
        '<div class="preview-status uploader-full"><span class="icon-cross"></span></div>' +
        '<div class="preview-progress uploader-full uploader-hide"></div>' +
        '</div>',
        ITEM: {
            'img': '<img src="{1}">'
        },
        INPUT: '<input class="uploader-hide uploader-input" accept="{1}" type="file" id="file" name="file" {2}/>'
    };

    Uploader.defaults = {
        selector: null,
        multiple: false,
        accept: '*/*',
        ajax: {
            url: '',
            data: {},
            callback: function() {

            }
        },
        language: {
            hint: 'Hint',
            cancel: 'Cancel',
            clear: 'Clear',
            upload: 'Upload'
        },
        type: Uploader.TYPE.IMG,
        queue: []
    };

    Uploader._readFile = function(file, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            if (callback && typeof(callback) === 'function') {
                callback(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    Uploader.prototype.init = function() {
        if (!this.options.selector) {
            console.log('[uploader error] -----> no selector!');
            return false;
        }
        this._prepare();
        this._render();
        return this;
    };

    Uploader.prototype._prepare = function() {
        this.options.multiple = this.options.multiple ? 'multiple="multiple"' : '';
    };

    Uploader.prototype._render = function() {
        this.$uploader = this.options.selector;
        // 基础框架
        this.$uploader.append(T.sprintf(
                Uploader.TEMPLATE.WRAPPER,
                this.options.language.hint,
                this.options.language.upload,
                this.options.language.clear,
                this.options.language.add
            )
        );
        this._cacheUploaderDom();
        // 隐藏上传域
        this.$uploaderWrapper.append(T.sprintf(
                Uploader.TEMPLATE.INPUT,
                this.options.accept,
                this.options.multiple
            )
        );
        this._bindEvents();
    };

    Uploader.prototype._cacheUploaderDom = function() {
        this.$uploaderWrapper =     this.$uploader.find('.uploader-wrapper');   // wrapper
        this.$uploaderHint =        this.$uploader.find('.uploader-hint');      // hint
        this.$uploaderItem =        this.$uploader.find('.uploader-item');      // upload area
        this.$uploaderDo =          this.$uploader.find('.uploader-do');            // button upload
        this.$uploaderCancelAll =   this.$uploader.find('.uploader-cancel-all');    // button cancel
        T.disableBtn(this.$uploaderDo);
        T.disableBtn(this.$uploaderCancelAll);
    };

    Uploader.prototype._resetStatus = function() {
        T.disableBtn(this.$uploaderDo);
        T.disableBtn(this.$uploaderCancelAll);
        this.$uploaderItem.addClass('uploader-hide');
        this.$uploaderHint.removeClass('uploader-hide');
        this.$uploaderItem.html('');
    };

    Uploader.prototype._bindEvents = function() {
        var that = this;
        // 点击事件
        this.$uploader.on('click', function(e) {
            var $target = $(e.target);
            if ($target.is('.uploader-cancel-all')) {
                that._resetStatus();
                return false;
            }
            if ($target.is('.uploader-do')) {
                that._ajax();
                return false;
            }
            if ($target.is('.uploader-add, .uploader-hint, .uploader-body, .uploader-item')) {
                $('.uploader-input').click();
                return false;
            }
        });
        // 文件选择
        $('.uploader-input').on('change', this, this._fileHandler);
        // 文件拖拽
    };

    Uploader.prototype._bindEventsAfter = function() {
        // 划动事件
        var that = this;
        that.$uploaderItem.find('.preview-wrapper').on('mouseenter', function(e) {
            var $target = $(e.target);
            if ($target.is('.preview-status, .preview-item, .preview-item *')) {
                $(this).find('.preview-overlay').removeClass('uploader-hide');
                $(this).find('.preview-status').addClass('preview-status-active');
            }
        }).on('mouseleave', function(e) {
            var $target = $(e.target);
            if ($target.is('.preview-status, .preview-item, .preview-item *')) {
                $(this).find('.preview-overlay').addClass('uploader-hide');
                $(this).find('.preview-status').removeClass('preview-status-active');
            }
        }).on('click', function(e) {
            var $target = $(e.target);
            if ($target.is('.preview-status, .preview-status *')) {
                $target.closest('.preview-wrapper').remove();
                if (that.$uploaderItem.find('.preview-wrapper').length === 0) {
                    that._resetStatus();
                }
            }
        });
    };

    Uploader.prototype._fileHandler = function(e) {
        var files = this.files;
        var that = e.data;
        for (var i = 0, len = files.length; i < len; i++) {
            that._preview(files.item(i));
        }
        this.value = '';
    };

    Uploader.prototype._preview = function(file) {
        var that = this;
        that.$uploaderHint.addClass('uploader-hide');
        that.$uploaderItem.removeClass('uploader-hide');
        T.enableBtn(that.$uploaderDo);
        T.enableBtn(that.$uploaderCancelAll);

        var uuid = T.generateUuid();
        var preview = T.sprintf(Uploader.TEMPLATE.PREVIEW, uuid);
        this.$uploaderItem.append(preview);
        var $preview = this.$uploaderItem.find('.preview-' + uuid);
        $preview.data('file', file);
        Uploader._readFile(file, function(result) {
            $preview.find('.preview-item').append(T.sprintf(Uploader.TEMPLATE.ITEM[that.options.type], result));
            that._bindEventsAfter();
        })
    };

    Uploader.prototype._ajax = function() {
        var that = this;
        var $previews = this.$uploaderItem.find('.preview-wrapper[data-do="ready"]');
        T.disableBtn(that.$uploaderCancelAll);
        T.disableBtn(that.$uploaderDo);
        $previews.each(function() {
            that.options.queue.push($(this));
            that._doUpload($(this));
        });
    };

    Uploader.prototype._doUpload = function($preview) {

        var that = this;
        var $progress = $preview.find('.preview-progress');
        $preview.off('mouseenter').off('mouseleave');
        $progress.removeClass('uploader-hide');
        var xhr = new XMLHttpRequest();
        var fd = new FormData();
        xhr.upload.addEventListener('progress', function(e) {
            if (e['lengthComputable']) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                $progress.css('width', percentage + '%');
            }
        }, false);
        xhr.upload.addEventListener('load', function() {
            $progress.css('width', '100%');
        }, false);
        xhr.open('POST', this.options.ajax.url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var jsonData = {};
                try {
                    // show complete
                    $preview.find('.preview-overlay').removeClass('uploader-hide');
                    $preview.find('.preview-status').addClass('preview-status-active').children('span').addClass('icon-checkmark');
                    $progress.addClass('uploader-hide');
                    jsonData = JSON.parse(xhr['response']);
                    $preview.attr('data-do', 'done');
                } catch (e) {
                    jsonData.code = 100;
                    $preview.attr('data-do', 'error');
                }
                console.log("[upload  ] <----- |", jsonData);
                if (that.options.ajax.callback && 'function' === typeof(that.options.ajax.callback)) {
                    that.options.ajax.callback(jsonData);
                }
            }
            that.options.queue.pop();
            if (that.options.queue.length === 0) {
                T.enableBtn(that.$uploaderCancelAll);
                T.enableBtn(that.$uploaderDo);
            }
        };
        // post file
        fd.append('file', $preview.data('file'));
        fd.append('data', this.options.ajax.data);
        console.log("[upload  ] -----> |", $.extend({}, {file: $preview.data('file')}, this.options.ajax.data));
        xhr.send(fd);
    };

    uploader.factory = Uploader;
});


