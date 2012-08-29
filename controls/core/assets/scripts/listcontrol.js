/**
 * @author  xuld
 */
imports("Controls.Core.ListControl");
using("Controls.Core.ScrollableControl");


/**
 * 表示所有管理多个有序列的子控件的控件基类。
 * @class ListControl
 * @extends ScrollableControl
 * ListControl 封装了使用  &lt;ul&gt; 创建列表控件一系列方法。
 */
var ListControl = ScrollableControl.extend({
	
	/**
	 * 模板。
	 */
	tpl: '<ul class="x-control"/>',
	/**	 * 获取用于包装指定子控件的容器控件。	 * @param {Control} item 要获取的子控件。	 * @return {Control} 用于包装指定子控件的容器控件。	 * @protected override	 * @see #itemOf
	 */
	childOf: function(childControl) {
		return childControl && childControl.node.tagName !== 'LI' ? childControl.parent() : childControl;
	},
	
	/**
	 * 当被子类重写时，用于初始化新添加的节点。
	 * @param {Control} childControl 正在添加的节点。
	 * @return {Control} 需要真正添加的子控件。
	 * @protected override
	 */
	initChild: function(childControl){
		
		// <li> 的 class 属性。
		var clazz = 'x-' + this.xtype + '-item', li;

		// 如果 childControl 不是 <li>, 则包装一个 <li> 标签。
		if (childControl.node.tagName !== 'LI') {

			// 创建 <li>
			li = Dom.create('LI', clazz);
			
			// 复制节点。
			li.append(childControl);
			
			// 赋值。
			childControl = li;
		} else {
			
			// 自动加上 clazz 。
			childControl.addClass(clazz);
		}
		
		return childControl;
	},
	
	/**
 	 * 当新控件被移除时执行。
	 * @param {Control} childControl 新添加的元素。
	 * @return {Control} 需要真正删除的子控件。
	 * @protected override
	 */
	uninitChild: function(childControl) {
		
		// 如果 childControl 不是 <li>, 则退出 <li> 的包装。
		if (childControl.node.parentNode !== this.node) {
			
			// 获取包装的 <li>
			var li = childControl.parent();
			
			// 不存在 li 。
			if(!li) {
				return null;
			}
			
			// 删除节点。
			li.removeChild(childControl);
			
			// 赋值。
			childControl = li;
		}
		
		// 返回实际需要删除的组件。
		return childControl;

	},
	
	/**
	 * 当被子类重写时，实现初始化 DOM 中已经存在的项。 
	 */
	initItems: function(){
		this.query('>li').addClass('x-' + this.xtype + '-item');
	},
	
	init: function() {
		this.initItems();
	},
	
	/**
	 * 当当前控件在屏幕中显示不下时，由 align 函数触发执行此函数。
	 * @param {String} xOry 值为 "x" 或 "y"。
	 * @param {Integer} value 设置的最大值。
	 * @param {Boolean} isOverflowing 如果值为 true，表示发生了此事件，否则表示恢复此状态。
	 */
	onOverflow: function(xOry, value, isOverflowing){
		var data = this['overflow' + xOry];
		if(isOverflowing){
			if(!data){
				this['overflow' + xOry] = this[xOry === 'x' ? 'getWidth' : 'getHeight']();
			}
			this[xOry === 'x' ? 'setWidth' : 'setHeight'](value);
		} else if(data !== undefined){
			this[xOry === 'x' ? 'setWidth' : 'setHeight'](data);
			delete this['overflow' + xOry];
		}
	},
	
	indexOf: function(item){
		return ScrollableControl.prototype.indexOf.call(this, this.childOf(item));
	},

	getItemByText: function(value){
		for (var c = this.first(), child = null ; c; c = c.next()) {
			if (c.getText() === value) {
				child = c;
				break;
			}
		}
		
		return this.itemOf(child);
	},

	/**
	 * 设置某个事件发生之后，执行某个函数.
	 * @param {String} eventName 事件名。
	 * @param {String} funcName 执行的函数名。
	 */
	itemOn: function(eventName, fn, bind){
		var me = this;
		return this.on(eventName, function(e){
			for(var c = me.node.firstChild, target = e.target; c; c = c.nextSibling){
				if(c === target || Dom.has(c, target)){
					return fn.call(bind, me.itemOf(new Dom(c)), e);
				}
			}
		}, bind);
	}
	
});


ListControl.aliasMethods = function(controlClass, targetProperty, removeChildProperty){
	controlClass.defineMethods(targetProperty, 'add addAt removeAt item indexOf each count');
	
	removeChildProperty = removeChildProperty || targetProperty;
	controlClass.prototype.removeChild = function(childControl){
		childControl.detach(this.node);
		
		var child = this[removeChildProperty];
		if(child)
			childControl.detach(child.node);
	};
	
};