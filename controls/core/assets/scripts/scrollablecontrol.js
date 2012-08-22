/** * @author  xuld */imports("Controls.Core.ScrollableControl");using("Controls.Core.Base");/** * 表示一个含有滚动区域的控件。 * @class ScrollableControl * @extends Control * @abstract * @see ScrollableControl.ControlCollection * @see ListControl * @see ContainerControl * <p> * {@link ScrollableControl} 提供了完整的子控件管理功能。 * {@link ScrollableControl} 通过 {@link ScrollableControl.ControlCollection} 来管理子控件。 * 通过 {@link#controls} 属性可以获取其实例对象。 * </p> *  * <p> * 通过 {@link ScrollableControl.ControlCollection#add}  * 来增加一个子控件，该方法间接调用 {@link ScrollableControl.ControlCollection#onControlAdded}，以 * 让 {@link ScrollableControl} 有能力自定义组件的添加方式。 * </p> *  * <p> * 如果需要创建一个含子控件的控件，则可以 继承 {@link ScrollableControl} 类创建。 * 子类需要重写 {@link #initChildControl} 方法用于对子控件初始化。 * 重写 {@link #onControlAdded}实现子控件的添加方式（默认使用 appendChild 到跟节点）。 * 重写 {@link #onControlRemoved}实现子控件的删除方式。 * 重写 {@link #createChildCollection} 实现创建自定义的容器对象。 * </p> *  * <p> * 最典型的 {@link ScrollableControl} 的子类为 {@link ListControl} 和 {@link ContainerControl} 提供抽象基类。 * </p> */var ScrollableControl = Control.extend({		/**	 * 获取用于包装指定子控件的容器控件。	 * @param {Control} item 要获取的子控件。	 * @return {Control} 用于包装指定子控件的容器控件。	 * @protected virtual	 * @see #itemOf
	 */	containerOf: function(item) {		return item;	},		/**	 * 获取某一个容器节点封装的子控件。	 * @param {Control} container 要获取的容器控件。	 * @return {Control} 指定容器控件包装的真实子控件。如果不存在相应的子控件，则返回自身。	 * @protected virtual	 * @see #containerOf	 */	itemOf: function(container) {		return container;	},		/**	 * 当被子类重写时，用于初始化新添加的节点。	 * @param {Control} childControl 正在添加的节点。	 * @return {Control} 需要真正添加的子控件。	 * @protected virtual
	 */	initChild: function(childControl){		return childControl;	},	/**	 * 当被子类重写时，用于重写添加子控件的具体逻辑实现。	 * @param {Control} childControl 新添加的子控件。	 * @param {Control} refControl=null 用于表面添加的位置的子控件。指定控件会被插入到此控件之前。如果值为 null ，则添加到末尾。	 * @protected virtual	 */	onAdding: function(childControl, refControl) {				// 添加子节点到 container 容器。		childControl.attach(this.node, refControl ? refControl.node : null);	},		/** 	 * 当被子类重写时，用于重写删除子控件的具体逻辑实现。	 * @param {Control} childControl 要删除的子控件。	 * @protected virtual	 */	onRemoving: function(childControl) {				// 在 container 容器删除节点。		childControl.detach(this.node);	},	/**	 * 当新控件被添加时执行。	 * @param {Control} childControl 新添加的子控件。	 * @protected virtual	 */	onAdded: function(childControl){		this.trigger("added", childControl);	},		/** 	 * 当新控件被移除时执行。	 * @param {Control} childControl 要删除的子控件。	 * @protected virtual	 */	onRemoved: function(childControl){		this.trigger("removed", childControl);	},	/**	 * 当新控件被添加时执行。	 * @param {Control} childControl 新添加的元素。	 * @param {Control} refControl 元素被添加的位置。	 * @protected virtual	 */	insertBefore: function(childControl, refControl) {				childControl = this.initChild(childControl);				// 初始化子对象。		if(this.onAdding(childControl, refControl) !== false) {						// 通知当前类节点已添加。			this.onAdded(childControl);						// 返回新创建的子控件。			return childControl;					}				return null;	},	/**	 * 当新控件被移除时执行。	 * @param {Object} childControl 新添加的元素。	 * @protected virtual	 */	removeChild: function(childControl) {				// 获取子控件关联的项。		// 如果 childControl 不存在关联的 item，则忽视操作。		if(this.onRemoving(childControl) !== false){						// 通知当前类节点已删除。			this.onRemoved(childControl);			// 返回删除的子控件。			return childControl;		}				return null;	},	/**	 * 	 */	hasChild: function(childControl) {		return this.indexOf(childControl) >= 0;	},

	/**
	 * 添加一个子节点到当前控件末尾。
	 * @param {Control} ... 要添加的子节点。
	 * @return {Control/Control[]} 返回新添加的子控件。
	 */
	add: function() {
		var args = arguments;
		if (args.length === 1) {
			return this.append(args[0]);
		}

		return Object.map(args, this.append.bind(this), []);
	},		/**	 * 获取指定索引的项。	 */	item: function(index) {		var container = this.child(index);		return container ? this.itemOf(container) : container;	},	
	/**
	 * 对集合的每一项执行函数。
	 */
	each: function(fn, bind) {
		for (var c = this.first(), i = 0 ; c; c = c.next()) {
			if (fn.call(bind, this.itemOf(c), i++, this) === false) {
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
	indexOf: function(item) {				if(item = item && this.containerOf(item)){			item = item.node;
			for (var c = this.first(), i = 0 ; c; c = c.next(), i++) {
				if (item === c.node) {
					return i;
				}
			}		}
		return -1;
	},

	/**
	 * 在指定位置插入一个子节点。
	 * @param {Integer} index 添加的子控件的索引。
	 * @param {Control} childControl 要添加的子节点。
	 * @return {Control} 返回新添加的子控件。
	 */
	insertAt: function(index, childControl) {
		return this.insertBefore(Dom.parse(childControl), this.child(index));
	},

	/**
	 * 删除指定索引的子节点。
	 * @param {Integer} index 删除的子控件的索引。
	 * @return {Control} 返回删除的子控件。如果删除失败（如索引超出范围）则返回 null 。
	 */
	removeAt: function(index) {		var child = this.child(index);
		return child ? this.removeChild(child) : null;
	}	/**	 * 当子控件被添加时触发。	 * @event added	 * @param {Control} childControl 被添加的子控件。	 */	/**	 * 当子控件被添加时触发。	 * @event removed	 * @param {Control} childControl 被删除的子控件。	 */}).addEvents('added removed');