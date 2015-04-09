
'use strict';

var MarkdownEditor = require('./markdownEditor'),
    Preview = require('./preview'),
    Layout = require('./layout'),
    EventManager = require('./eventManager'),
    CommandMangager = require('./commandManager'),
    ExtManager = require('./extManager'),
    Converter = require('./converter');

var util = ne.util;

var __nedInstance = [];

function NEditor(options) {
    var defaultOptions = {
        'previewStyle': 'tab',
        'height': 300
    };

    var hooks = options.hooks,
        self = this;

    this.options = $.extend({}, defaultOptions, options);

    this.eventManager = new EventManager();
    this.commandManager = new CommandMangager(this);
    this.converter = new Converter(this.eventManager);

    this.layout = new Layout(options, this.eventManager, this.commandManager);
    this.layout.init();

    this.mdEditor = new MarkdownEditor(this.layout.getEditorContainerEl(), this.eventManager, this.commandManager);
    this.preview = new Preview(this.layout.getPreviewEl(), this.eventManager);


    //추후 옵션처리기에서 처리
    if (hooks) {
        util.forEach(hooks, function(fn, key) {
            self.eventManager.listen(key, fn);
        });
    }

    this.changePreviewStyle(this.options.previewStyle);

    NEditor._extManager.applyExtension(this, this.options.exts);

    this.mdEditor.init(this.options.initialValue);
    this.getCodeMirror().__ned = this;

    __nedInstance.push(this);
}

NEditor.prototype.changePreviewStyle = function(style) {
    this.layout.changePreviewStyle(style);
};

NEditor.prototype.getCursorOffset = function() {
};

NEditor.prototype.execCommand = function(command) {
    //현재 에디터 상태를 토대로 codeMirror혹은 Wysiwyg커맨드를 실행해주는 루틴
    this.getCodeMirror().execCommand(command);
};

NEditor.prototype.getCodeMirror = function() {
    return this.mdEditor.cm;
};

NEditor.prototype.focus = function() {
   this.mdEditor.focus();
};

NEditor.prototype.setValue = function(markdown) {
    this.mdEditor.setValue(markdown);
};

NEditor.prototype.getValue = function() {
    return this.mdEditor.getValue();
};

NEditor.prototype.remove = function() {
    console.log('remove');
};

NEditor.prototype.hide = function() {
    console.log('hide');
};

NEditor.prototype.getMarkdown = function() {
    console.log('getMarkdown');
};

NEditor.getInstances = function() {
    return __nedInstance;
};

NEditor.definedExtention = function(name, ext) {
    NEditor._extManager.defineExtension(name, ext);
};

NEditor._extManager = new ExtManager();


//for jquery
$.fn.ned = function() {
    var args = $.makeArray(arguments),
        options,
        instance,
        el;

    el = this[0];

    if (el) {
        options = args[0] || {};

        instance = $.data(el, 'ned');

        if (instance) {
            if (typeof options === 'string') {
                return instance[options].apply(instance, args.slice(1));
            }
        } else {
            options.el = el;
            instance = new NEditor(options);
            $.data(el, 'ned', instance);
        }
    }

    return this;
};

window.ne = window.ne || {};
window.ne.NEditor = NEditor;
