/** * @fileOverview 表示一个包含文本内容的控件。 * @author xuld */using("Controls.Core.Base");/** * 表示一个有内置呈现的控件。 * @abstract * @class ContentControl * @extends Control *  * <p> * ContentControl 的外元素是一个根据内容自动改变大小的元素。它自身没有设置大小，全部的大小依赖子元素而自动决定。 * 因此，外元素必须满足下列条件的任何一个: *  <ul> * 		<li>外元素的 position 是 absolute<li> * 		<li>外元素的 float 是 left或 right <li> * 		<li>外元素的 display 是  inline-block (在 IE6 下，使用 inline + zoom模拟) <li> *  </ul> * </p> */var ContentControl = Control.extend({		/**	 * 获取当前控件中显示文字的主 DOM 对象。	 */	content: function(){		return this.find('x-' + this.xtype + '-content') || new Dom(this.node);	},

    /**
	 * 获取或设置当前输入域的状态。
	 * @protected
	 */
	state: function (name, value) {
	    return this.toggleClass('x-' + this.xtype + '-' + name, value);
	}	}).defineMethods("content()", "setHtml getHtml setText getText");