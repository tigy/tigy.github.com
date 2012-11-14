/**
 * @author  xuld
 */

imports("Controls.Button.Button");
imports("Controls.Button.MenuButton");
imports("Controls.Suggest.Picker");
using("Controls.Core.Base");
using("Controls.Core.IInput");
using("Controls.Core.IDropDownOwner");

/**
 * 表示一个数据选择器。
 * @abstract class
 * @extends Control
 */
var Picker = Control.extend(IInput).implement(IDropDownOwner).implement({

    /**
	 * 当前控件的 HTML 模板字符串。
	 * @getter {String} tpl
	 * @protected virtual
	 */
    tpl: '<span class="x-picker">\
			<input type="text" class="x-textbox"/>\
		</span>',

    /**
	 * 当前控件以下拉形式时的 HTML 模板字符串。
	 * @getter {String} tpl
	 * @protected virtual
	 */
    dropDownListTpl: '<span class="x-picker">\
			<a href="javascript:;" class="x-button">A</a>\
		</span>',

    menuButtonTpl: '<button class="x-button" type="button"><span class="x-menubutton-arrow"></span></button>',

    /**
	 * 当前控件是否为下拉列表形式。
     * @type {Boolean}
	 */
    dropDownList: false,

    /**
	 * 下拉框的宽度。
	 */
    dropDownWidth: -1,

    /**
	 * @config dropDownList 是否允许用户输入自定义的文本值。
	 */

    create: function (options) {
        return Dom.parseNode(options.dropDownList ? this.dropDownListTpl : this.tpl);
    },

    /**
	 * 获取当前控件的按钮部分。
	 */
    button: function () {
        return this.find('button');
    },

    /**
	 * @protected
	 * @override
	 */
    init: function () {

        // 如果是 <input> 或 <a> 直接替换为 x-picker
        if (!this.first() && !this.hasClass('x-picker')) {
            var elem = this.node;

            // 创建 x-picker 组件。
            this.node = Dom.createNode('span', 'x-picker x-' + this.xtype);

            // 替换当前节点。
            if (elem.parentNode) {
                elem.parentNode.replaceChild(this.node, elem);
            }

            // 插入原始 <input> 节点。
            this.prepend(elem);
        }

        // 如果没有下拉菜单按钮，添加之。
        if (!this.button()) {
            this.append(this.menuButtonTpl);
        }

        // 初始化菜单。
        this.setDropDown(this.getDropDown());

        if (!this.hasOwnProperty('dropDownList') && this.first().node.tagName !== 'INPUT') {
            this.dropDownList = true;
        }

        // 设置菜单显示的事件。
        (this.dropDownList ? this : this.button()).on('click', this.toggleDropDown, this);

    },


    onSelect: function (item) {
        return this.trigger('select', item);
    },

    onChange: function () {
        this.trigger('change');
    },

    onUp: function () {        },

    onDown: function () {
    },

    onEnter: function () {
    },

    /**
	 * 处理键盘事件。
	 */
    onKeyDown: function (e) {

    },

    setWidth: function (value) {
        var first = this.first();
        if (value >= 0) {
            value -= this.getWidth() - first.getWidth();
        }
        first.setWidth(value);
        return this;
    },

    state: function (name, value) {
        value = value !== false;
        if (name == "disabled" || name == "readonly") {

            // 为按钮增加 disabled 样式。
            this.query('.x-button,button').setAttr("disabled", value).toggleClass("x-button-disabled", value);

            // 为文本框增加设置样式。
            this.input().setAttr(name, value).toggleClass("x-textbox-" + name, value);

        } else if (name == "actived") {
            this.query('.x-button,button').toggleClass("x-button-actived", value);
        } else {
            IInput.state.call(this, name, value);
        }

        return this;
    },

    // 下拉菜单

    onDropDownShow: function () {
        // 默认选择当前值。
        this.updateDropDown();
        this.state('actived', true);
        return IDropDownOwner.onDropDownShow.apply(this, arguments);
    },

    onDropDownHide: function () {
        this.state('actived', false);
        return IDropDownOwner.onDropDownHide.apply(this, arguments);
    },

    /**
	 * 将当前文本的值同步到下拉菜单。
	 * @protected virtual
	 */
    updateDropDown: Function.empty

}).addEvents('select')
.addEvents('change', {
    add: function (picker, type, fn) {
        Dom.$event.$default.add(picker.input(), type, fn);
    },
    remove: function (picker, type, fn) {
        Dom.$event.$default.remove(picker.input(), type, fn);
    }
});

/**
 * 表示一个数据选择器。
 * @abstract class
 * @extends Control
 */
var Picker = Control.extend(IInput).implement(IDropDownOwner).implement({

    /**
	 * 当前控件的 HTML 模板字符串。
	 * @getter {String} tpl
	 * @protected virtual
	 */
    tpl: '<span class="x-picker">\
			<input type="text" class="x-textbox"/>\
		</span>',
    /**
	 * 当前控件下拉按钮的 HTML 模板字符串。
	 * @getter {String} tpl
	 * @protected virtual
	 */
    menuButtonTpl: '<button class="x-button" type="button"><span class="x-menubutton-arrow"></span></button>',

    /**
	 * 下拉框的宽度。
	 */
    dropDownWidth: -1,

    /**
	 * 获取当前控件的按钮部分。
	 */
    button: function () {
        return this.find('button');
    },

    // 下拉菜单
    
    createDropDown: function(existDom){
    	return existDom;
    },

    /**
	 * 将当前文本的值同步到下拉菜单。
	 * @protected virtual
	 */
    updateDropDown: Function.empty,

    onDropDownShow: function () {
        // 默认选择当前值。
        this.updateDropDown();
        this.state('actived', true);
        return IDropDownOwner.onDropDownShow.call(this);
    },

    onDropDownHide: function () {
        this.state('actived', false);
        return IDropDownOwner.onDropDownHide.call(this);
    },

    /**
	 * @protected
	 * @override
	 */
    init: function () {

        // 如果是 <input> 或 <a> 直接替换为 x-picker
        if (!this.first() && !this.hasClass('x-picker')) {
            var elem = this.node;

            // 创建 x-picker 组件。
            this.node = Dom.createNode('span', 'x-picker x-' + this.xtype);

            // 替换当前节点。
            if (elem.parentNode) {
                elem.parentNode.replaceChild(this.node, elem);
            }

            // 插入原始 <input> 节点。
            this.prepend(elem);
        }

        // 如果没有下拉菜单按钮，添加之。
        if (!this.button()) {
            this.append(this.menuButtonTpl);
        }

        // 初始化菜单。
        this.setDropDown(this.createDropDown(this.next('.x-dropdown')));

        // 设置菜单显示的事件。
        this.button().on('click', this.toggleDropDown, this);

    },

    setWidth: function (value) {
        var first = this.first();
        if (value >= 0) {
            value -= this.getWidth() - first.getWidth();
        }
        first.setWidth(value);
        return this;
    },

    state: function (name, value) {
        value = value !== false;
        if (name == "disabled" || name == "readonly") {

            // 为按钮增加 disabled 样式。
            this.query('.x-button,button').setAttr("disabled", value).toggleClass("x-button-disabled", value);

            // 为文本框增加设置样式。
            this.input().setAttr(name, value).toggleClass("x-textbox-" + name, value);

        } else if (name == "actived") {
            this.query('.x-button,button').toggleClass("x-button-actived", value);
        } else {
            IInput.state.call(this, name, value);
        }

        return this;
    }

}).addEvents('change select', {
    add: function (picker, type, fn) {
        Dom.$event.$default.add(picker.input(), type, fn);
    },
    remove: function (picker, type, fn) {
        Dom.$event.$default.remove(picker.input(), type, fn);
    }
});

