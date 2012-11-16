/**
 * @author xuld
 */


using("Controls.Core.Base");


/**
 * 所有内容控件的基类。
 * @abstract class
 * @extends Control
 */
var ContentControl = Control.extend({
	
	// 基本属性

    /**
	 * 当前控件的 HTML 模板字符串。
	 * @getter {String} tpl
	 * @protected virtual
	 */
	tpl: '<div class="x-control">\
			<div class="x-control-content"></div>\
		</div>',
	
    /**
	 * 获取当前容器用于存放内容的 Dom 对象。
	 * @return {Dom}
     * @protected virtual
	 */
	content: function(){
		return this.find('x-' + this.xtype + '-content') || new Dom(this.node);
	},

    /**
	 * 设置当前输入域的状态, 并改变控件的样式。
     * @param {String} name 状态名。
     * @param {Boolean} value=false 要设置的状态值。
	 * @protected virtual
	 */
	state: function (name, value) {
	    this.toggleClass('x-' + this.xtype + '-' + name, value);
	}
	
}).defineMethods("content()", "setHtml getHtml setText getText");


