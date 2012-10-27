/**
 * @author  xuld
 */
using("Controls.Core.Base");


/**
 * 表示所有管理多个有序列的子控件的控件基类。
 * @class ListControl
 * @extends ScrollableControl
 * ListControl 封装了使用  &lt;ul&gt; 创建列表控件一系列方法。
 */
var ListControl = Control.extend({
	
	/**
	 * 模板。
	 */
	tpl: '<ul class="x-control"/>',
	
	// 内部实现的项操作
		
	/**
	 * 当新控件被添加时执行。
	 * @param {Control} childControl 新添加的元素。
	 * @param {Control} refControl 元素被添加的位置。
	 * @protected override
	 */
	insertBefore: function(childControl, refControl) {
		
		// 如果 childControl 不是 <li>, 则包装一个 <li> 标签。
		if (childControl.node.tagName !== 'LI') {

			// 创建 <li>
			var li = Dom.create('LI');
			
			// 复制节点。
			li.append(childControl);
			
			// 赋值。
			childControl = li;
		}

		// 自动加上 clazz 。
		childControl.addClass('x-' + this.xtype + '-item');
		
		// 插入 DOM 树。
		childControl.attach(this.node, refControl && refControl.node || null);
			
		// 返回新创建的子控件。
		return childControl;
	},

	/**
	 * 当新控件被移除时执行。
	 * @param {Object} childControl 新添加的元素。
	 * @protected override
	 */
	removeChild: function(childControl) {
		
		// 如果 childControl 不是 <li>, 则退出 <li> 的包装。
		if (childControl.node.parentNode !== this.node) {
			
			// 获取包装的 <li>
			var li = childControl.parent();
			
			// 不存在 li 。
			if(!li) {
				return null;
			}
			
			// 删除节点。
			childControl.detach(li.node);
			
			// 赋值。
			childControl = li;
		}
		
		// 从 DOM 树删除。
		childControl.detach(this.node);
		
		// 返回被删除的子控件。
		return childControl;
	},
	
	/**
	 * 当被子类重写时，实现初始化 DOM 中已经存在的项。 
	 */
	init: function() {
		this.query('>li').addClass('x-' + this.xtype + '-item');
	},
	
	// 项操作

	/**
	 * 添加一个子节点到当前控件末尾。
	 * @param {Control} ... 要添加的子节点。
	 * @return {Control/this} 返回新添加的子控件。
	 */
	add: function() {
		var args = arguments;
		if (args.length === 1) {
			return this.append(args[0]);
		}

		Object.each(args, this.append, this);
		return this;
	},

	/**
	 * 在指定位置插入一个子节点。
	 * @param {Integer} index 添加的子控件的索引。
	 * @param {Control} childControl 要添加的子节点。
	 * @return {Control} 返回新添加的子控件。
	 */
	addAt: function(index, childControl) {
		return this.insertBefore(Dom.parse(childControl), this.child(index));
	},

	/**
	 * 删除指定索引的子节点。
	 * @param {Integer} index 删除的子控件的索引。
	 * @return {Control} 返回删除的子控件。如果删除失败（如索引超出范围）则返回 null 。
	 */
	removeAt: function(index) {
		var child = this.child(index);
		return child ? this.removeChild(child) : null;
	},
	
	/**
	 * 批量设置当前的项列表。
	 */
	set: function(items){
		if(Object.isArray(items)){
			this.empty();
			this.add.apply(this, items);
			return this;
		}
		
		return Dom.prototype.set.apply(this, arguments);
	},
	
	/**
	 * 获取指定索引的项。
	 * @param {Integer} container 要获取的容器控件。
	 * @return {Control} 指定容器控件包装的真实子控件。如果不存在相应的子控件，则返回自身。
	 */
	item: Dom.prototype.child,

	/**
	 * 获取某一项在列表中的位置。
	 */
	indexOf: function(item) {
		return item && item.parent && this.equals(item.parent()) ? item.index() : -1;
	},
	
	// /**
	 // * 当当前控件在屏幕中显示不下时，由 align 函数触发执行此函数。
	 // * @param {String} xOry 值为 "x" 或 "y"。
	 // * @param {Integer} value 设置的最大值。
	 // * @param {Boolean} isOverflowing 如果值为 true，表示发生了此事件，否则表示恢复此状态。
	 // */
	// onOverflow: function(xOry, value, isOverflowing){
		// var data = this['overflow' + xOry];
		// if(isOverflowing){
			// if(!data){
				// this['overflow' + xOry] = this[xOry === 'x' ? 'getWidth' : 'getHeight']();
			// }
			// this[xOry === 'x' ? 'setWidth' : 'setHeight'](value);
		// } else if(data !== undefined){
			// this[xOry === 'x' ? 'setWidth' : 'setHeight'](data);
			// delete this['overflow' + xOry];
		// }
	// },

	getItemByText: function(value){
		for (var c = this.first(), child ; c; c = c.next()) {
			if (c.getText() === value) {
				child = c;
				break;
			}
		}
		
		return child;
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
					return fn.call(bind, new Dom(c), e);
				}
			}
		}, bind);
	}

});



/**
 * 为非 ListControl 对象扩展 ListControl 的6个方法: add addAt remove removeAt set item
 */
ListControl.aliasMethods = function(controlClass, targetProperty, removeChildProperty){
	controlClass.defineMethods(targetProperty, 'add addAt removeAt item set');
	
	removeChildProperty = removeChildProperty || targetProperty;
	controlClass.prototype.removeChild = function(childControl){
		
		// 尝试在代理的列表中删除项。
		var child = this[removeChildProperty];
		if(child)
			childControl.remove(childControl);
		
		// 尝试在当前节点中正常删除。
		childControl.detach(this.node);
		
		return childControl;
	};
	
};