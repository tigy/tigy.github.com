/** * @author  xuld */imports("Controls.Core.ScrollableControl");using("System.Data.Collection");using("Controls.Core.Base");/** * 表示一个含有滚动区域的控件。 * @class ScrollableControl * @extends Control * @abstract * @see ScrollableControl.ControlCollection * @see ListControl * @see ContainerControl * <p> * {@link ScrollableControl} 提供了完整的子控件管理功能。 * {@link ScrollableControl} 通过 {@link ScrollableControl.ControlCollection} 来管理子控件。 * 通过 {@link#controls} 属性可以获取其实例对象。 * </p> *  * <p> * 通过 {@link ScrollableControl.ControlCollection#add}  * 来增加一个子控件，该方法间接调用 {@link ScrollableControl.ControlCollection#onControlAdded}，以 * 让 {@link ScrollableControl} 有能力自定义组件的添加方式。 * </p> *  * <p> * 如果需要创建一个含子控件的控件，则可以 继承 {@link ScrollableControl} 类创建。 * 子类需要重写 {@link #initChildControl} 方法用于对子控件初始化。 * 重写 {@link #onControlAdded}实现子控件的添加方式（默认使用 appendChild 到跟节点）。 * 重写 {@link #onControlRemoved}实现子控件的删除方式。 * 重写 {@link #createChildCollection} 实现创建自定义的容器对象。 * </p> *  * <p> * 最典型的 {@link ScrollableControl} 的子类为 {@link ListControl} 和 {@link ContainerControl} 提供抽象基类。 * </p> */var ScrollableControl = Control.extend({		/**	 * 获取当前控件实际的容器控件。	 * @type {Control}
	 */	container: null,		/**	 * 获取某一个子节点或控件对应当前集合中的项。	 * @param {Control} childControl 要获取的子控件。	 * @return {Control} 用于管理指定子节点的容器项。	 * @protected virtual
	 */	itemOf: function(childControl) {		if(childControl.node.nodeType !== 1){			childControl = childControl.parent();		}		return childControl.node.nodeType !== 1 ? childControl.parent() : childControl;	},	/**	* 当新控件被添加时执行。	* @param {Control} childControl 新添加的元素。	* @protected virtual	*/	onAdding: function(childControl) {		if(childControl.node.nodeType !== 1){			var t = childControl;			childControl = Dom.create('span', 'x-' + this.xtype + '-item');			childControl.append(t);		}		return childControl;	},		/** 	 * 当新控件被移除时执行。	 * @param {Control} childControl 新添加的元素。	 * @protected virtual	 */	onRemoving: function(childControl) {		if(childControl.node.nodeType !== 1){			var t = childControl;			childControl = childControl.parent();			childControl.removeChild(t);		}		return childControl;	},	/**	* 当新控件被添加时执行。	* @param {Control} childControl 新添加的元素。	* @protected virtual	*/	onAdded: function(childControl){		this.trigger("added", childControl);	},		/** 	 * 当新控件被移除时执行。	 * @param {Control} childControl 新添加的元素。	 * @protected virtual	 */	onRemoved: function(childControl){		this.trigger("removed", childControl);	},
	init: function(){		this.container = this;	},	/**	 * 当新控件被添加时执行。	 * @param {Control} childControl 新添加的元素。	 * @param {Control} refControl 元素被添加的位置。	 * @protected virtual	 */	insertBefore: function(childControl, refControl) {				// 创建项。		var item = this.onAdding(childControl, refControl);				// 添加子节点到 container 容器。		item.attach(this.container.node, refControl ? refControl.node : null);				// 关联节点。		childControl.parentControl = this;				// 通知当前类节点已添加。		this.onAdded(item);				// 返回新创建的子控件。		return item;	},	/**	 * 当新控件被移除时执行。	 * @param {Object} childControl 新添加的元素。	 * @protected virtual	 */	removeChild: function(childControl) {				// 获取子控件关联的项。		var item = this.onRemoving(childControl);				// 如果 childControl 不存在关联的 item，则忽视操作。		if(item){						// 在 container 容器删除节点。			item.detach(this.container.node);						// 关联节点。			childControl.parentControl = null;						// 通知当前类节点已删除。			this.onRemoved(item);		}		// 返回删除的子控件。		return item;	},	/**	 * 	 */	hasChild: function(childControl) {		return this.indexOf(childControl) >= 0;	},
		/**	 * 获取列表中指定索引的项。	 */	item: Dom.prototype.child,	
	/**
	 * 对集合的每一项执行函数。
	 */
	each: function(fn, bind) {
		for (var c = this.first(), i = 0 ; c; c = c.next()) {
			if (fn.call(bind, c, i++, this) === false) {
				return false;
			}
		}

		return true;
	},

	/**
	 * 获取当前集合中子元素的项。
	 */
	count: function(all) {
		for (var c = this.first(all), i = 0 ; c; c = c.next(all), i++);
		return i;
	},

	/**
	 * 获取某一项在列表中的位置。
	 */
	indexOf: function(item) {				if(item = item && this.itemOf(item)){			item = item.node;
			for (var c = this.first(), i = 0 ; c; c = c.next(), i++) {
				if (item === c.node) {
					return i;
				}
			}	}
		return -1;
	},

	/**
	 * 在当前集合中插入一项到末尾。
	 */
	add: Dom.prototype.append,

	/**
	 * 在当前集合中插入一项。
	 */
	insertAt: function(index, childControl) {
		return this.insertBefore(childControl, this.item(index));
	},

	/**
	 * 在当前集合中移除一项。
	 */
	removeAt: function(index) {		var item = this.item(index);
		return item ? this.removeChild(item) : null;
	}});