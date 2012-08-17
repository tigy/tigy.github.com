/** * @author  xuld */imports("Controls.Core.ScrollableControl");using("System.Data.Collection");using("Controls.Core.Base");/** * 表示一个含有滚动区域的控件。 * @class ScrollableControl * @extends Control * @abstract * @see ScrollableControl.ControlCollection * @see ListControl * @see ContainerControl * <p> * {@link ScrollableControl} 提供了完整的子控件管理功能。 * {@link ScrollableControl} 通过 {@link ScrollableControl.ControlCollection} 来管理子控件。 * 通过 {@link#controls} 属性可以获取其实例对象。 * </p> *  * <p> * 通过 {@link ScrollableControl.ControlCollection#add}  * 来增加一个子控件，该方法间接调用 {@link ScrollableControl.ControlCollection#onControlAdded}，以 * 让 {@link ScrollableControl} 有能力自定义组件的添加方式。 * </p> *  * <p> * 如果需要创建一个含子控件的控件，则可以 继承 {@link ScrollableControl} 类创建。 * 子类需要重写 {@link #initChildControl} 方法用于对子控件初始化。 * 重写 {@link #onControlAdded}实现子控件的添加方式（默认使用 appendChild 到跟节点）。 * 重写 {@link #onControlRemoved}实现子控件的删除方式。 * 重写 {@link #createChildCollection} 实现创建自定义的容器对象。 * </p> *  * <p> * 最典型的 {@link ScrollableControl} 的子类为 {@link ListControl} 和 {@link ContainerControl} 提供抽象基类。 * </p> */var ScrollableControl = Control.extend({

	// 节点操作

	/**
	 * 获取列表中指定索引的项。
	 */
	item: Dom.prototype.child,

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
	count: function() {
		for (var c = this.first(), i = 0 ; c; c = c.next()) {
			i++;
		}

		return i;
	},

	/**
	 * 获取某一项在列表中的位置。
	 */
	indexOf: function(item) {
		item = item && item.node || item;
		for (var c = this.first(), i = 0 ; c; c = c.next(), i++) {
			if (item === c.node) {
				return i;
			}
		}
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
	removeAt: function(index) {
		return this.removeChild(this.item(index));
	},	/**	 * 根据用户的输入创建一个新的子控件。	 * @param {Control} item 新添加的元素。	 * @return {Control} 一个控件，根据用户的输入决定。	 * @protected virtual	 * 默认地，如果输入字符串和DOM节点，将转为对应的控件。	 */	initChild: function(childControl) {
		childControl.parentControl = this;		return childControl;	},	/**	 * 当新控件被添加时执行。	 * @param {Control} childControl 新添加的元素。	 * @param {Control} refControl 元素被添加的位置。	 * @protected virtual	 */	insertBefore: function(childControl, refControl) {
		childControl = this.initChild(childControl);
		return this.container.insertBefore(childControl, refControl);
	},	/**	 * 当新控件被移除时执行。	 * @param {Object} childControl 新添加的元素。	 * @protected virtual	 */	removeChild: function(childControl) {
		return this.container.removeChild(childControl);
	},	///**	// * 当新控件被添加时执行。	// * @param {Object} childControl 新添加的元素。	// * @param {Number} index 元素被添加的位置。	// * @protected virtual	// */	//onControlAdded: function(childControl, index){	//	index = this.controls[index];	//	assert(childControl && childControl.attach, "Control.prototype.onControlAdded(childControl, index): {childControl} \u5FC5\u987B\u662F\u63A7\u4EF6\u3002", childControl);	//	childControl.attach(this.container.node, index ? index.node : null);	//},		///**	// * 当新控件被移除时执行。	// * @param {Object} childControl 新添加的元素。	// * @param {Number} index 元素被添加的位置。	// * @protected virtual	// */	//onControlRemoved: function(childControl, index){	//	assert(childControl && childControl.detach, "Control.prototype.onControlRemoved(childControl, index): {childControl} \u5FC5\u987B\u662F\u63A7\u4EF6\u3002", childControl);	//	childControl.detach(this.container.node);	//},	///**	// * 当被子类重新时，实现创建一个子控件列表。	// * @return {ScrollableControl.ControlCollection} 子控件列表。	// * @protected virtual	// */	//createControlsInstance: function(){	//	return new ScrollableControl.ControlCollection(this);	//},		// /**	 // * 获取当前控件用于存放子节点的容器控件。	 // * @protected virtual	 // */	// getContainer: function(){		// return this;	// },		/**	 * 获取目前所有子控件。	 * @type {Control.ControlCollection}	 * @name controls	 */	constructor: function(){		this.container = this;		Control.prototype.constructor.apply(this, arguments);	}});