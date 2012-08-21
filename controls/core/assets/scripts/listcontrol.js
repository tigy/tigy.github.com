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
	/**	 * 获取用于包装指定子控件的容器控件。	 * @param {Control} item 要获取的子控件。	 * @return {Control} 用于包装指定子控件的容器控件。	 * @protected virtual	 * @see #itemOf
	 */
	containerOf: function(childControl) {
		return childControl.node.tagName !== 'LI' ? childControl.parent() : childControl;
	},	/**	 * 获取某一个容器节点封装的子控件。	 * @param {Control} container 要获取的容器控件。	 * @return {Control} 指定容器控件包装的真实子控件。如果不存在相应的子控件，则返回自身。	 * @protected virtual	 * @see #containerOf	 * @remark 该函数实际上会返回 container.dataField().namedItem 属性值。	 */	itemOf: function(container) {
		return container.dataField().namedItem || container;
	},

	/**
	* 当新控件被添加时执行。
	* @param {Control} childControl 新添加的元素。
	* @protected virtual
	*/
	onAdding: function(childControl, refControl) {
		
		// <li> 的 class 属性。
		var clazz = 'x-' + this.xtype + '-item', li;

		// 如果 childControl 不是 <li>, 则包装一个 <li> 标签。
		if (childControl.node.tagName !== 'LI') {

			// 创建 <li>
			li = Dom.create('LI', clazz);
			
			// 复制节点。
			li.append(childControl);
			
			// 存储 <li> -> 子控件的关联。
			li.dataField().namedItem = childControl;
			
			// 因为 childControl 被包了一层 <li> ，因此设置 parentControl 属性以便删除时可以通过当前控件删除此控件。
			childControl.parentControl = this;
			
			// 赋值。
			childControl = li;
		} else {
			
			// 自动加上 clazz 。
			childControl.addClass(clazz);

			// 如果插入的项是选中的，则先删除之前的选中项。
			if (this.baseGetSelected(childControl)) {
				this.setSelectedItem(null);
			}
		}

		// 添加 <li> 到 <ul>。
		childControl.attach(this.node, refControl ? refControl.node : null);
	},
	
	/**
 	 * 当新控件被移除时执行。
	 * @param {Control} childControl 新添加的元素。
	 * @protected virtual
	 */
	onRemoving: function(childControl) {
		
		// 如果 childControl 不是 <li>, 则退出 <li> 的包装。
		if (childControl.node.tagName !== 'LI') {
			
			// 获取包装的 <li>
			var li = childControl.parent();
			
			// 不存在 li 。
			if(!li) {
				return false;
			}
			
			// 删除节点。
			li.removeChild(childControl);

			// 删除关联节点。
			childControl.parentControl = null;
			
			// 赋值。
			childControl = li;
		}

		// 如果插入的项是选中的，则先删除之前的选中项。
		if (this.baseGetSelected(childControl)) {
			this.setSelectedItem(childControl.next());
		}

		// 删除 <li>。
		childControl.detach(this.node);
	},

	init: function() {
		this.query('>li').addClass('x-' + this.xtype + '-item');
	},

	onOverFlowY: function(max) {
		this.setHeight(max);
	},
	
	// 选择功能
	
	/**
	 * 底层获取某项的选中状态。该函数仅仅检查元素的 class。
	 */
	baseGetSelected: function (container) {
		return container.hasClass('x-' + this.xtype + '-selected');
	},
	
	/**
	 * 底层设置某项的选中状态。该函数仅仅设置元素的 class。
	 */
	baseSetSelected: function(container, value) {
		container.toggleClass('x-' + this.xtype + '-selected', value);
	},
	
	/**
	 * 当选中的项被更新后触发。
	 */
	onChange: function (old, item){
		return this.trigger('change', {
			from: old,
			to: item
		});
	},
	
	/**
	 * 当某项被选择时触发。如果返回 false， 则事件会被阻止。
	 */
	onSelect: function (item){
		return this.trigger('select', item);
	},
	
	/**
	 * 切换某一项的选择状态。
	 */
	toggleSelected: function(item) {

		var selected = this.getSelectedItem();
		
		item = this.containerOf(item);
		
		// 如果当前项已选中，则表示反选当前的项。
		return this.setSelectedItem(selected && selected.node === item.node ? null : item);
	},
	
	/**
	 * 底层获取某项的选中状态。该函数仅仅检查元素的 class。
	 */
	isSelectable: function (item) {
		return true;
	},
	
	/**
	 * 获取当前选中项的索引。如果没有向被选中，则返回 -1 。
	 */
	getSelectedIndex: function() {
		for (var c = this.first(), i = 0 ; c; c = c.next(), i++) {
			if (this.baseGetSelected(c)) {
				return i;
			}
		}

		return -1;
	},
	
	/**
	 * 设置当前选中项的索引。
	 */
	setSelectedIndex: function (value) {
		return this.setSelectedItem(this.child(value));
	},
	
	/**
	 * 获取当前选中的项。如果不存在选中的项，则返回 null 。
	 */
	getSelectedItem: function () {
		for (var c = this.first() ; c; c = c.next()) {
			if (this.baseGetSelected(c)) {
				return this.itemOf(c);
			}
		}

		return null;
	},
	
	/**
	 * 设置某一项为选中状态。对于单选框，该函数会同时清除已有的选择项。
	 */
	setSelectedItem: function(item){
		
		// 先反选当前选择项。
		var old = this.getSelectedItem();
		if(old)
			this.baseSetSelected(this.containerOf(old), false);
		
		// 选择项。
		if(this.onSelect(item) && item != null){
			this.baseSetSelected(this.containerOf(item), true);
		}
		
		// 触发 onChange 事件。
		if((old ? old.node : null) !== (item ? item.node : null))
			this.onChange(old, item);
			
		return this;
	},
	
	/**
	 * 获取选中项的文本内容。
	 */
	getText: function () {
		var selectedItem = this.getSelectedItem();
		return selectedItem ? selectedItem.getText() : '';
	},
	
	/**
	 * 查找并选中指定文本内容的项。如果没有项的文本和当前项相同，则清空选择状态。
	 */
	setText: function(value) {
		
		for (var c = this.first(), item = null ; c; c = c.next()) {
			if (c.getText() === value) {
				item = c;
				break;
			}
		}
		
		return this.setSelectedItem(item);
	},
	
	/**
	 * 确保当前有至少一项被选择。
	 */
	select: function () {
		if (this.getSelectedIndex() < 0) {
			this.setSelectedIndex(0);
		}
		
		return this;
	},
	
	/**
	 * 选择当前选择项的下一项。
	 */
	selectNext: function(up){
		var oldIndex = this.getSelectedIndex(), 
			newIndex, 
			maxIndex = this.count() - 1,
			item,
			available = maxIndex;
		
		do {
			if(oldIndex != -1) {
				newIndex = oldIndex + ( up !== false ? 1 : -1);
				if(newIndex < 0) newIndex = maxIndex;
				else if(newIndex > maxIndex) newIndex = 0;
			} else {
				newIndex = up !== false ? 0 : maxIndex;
			}
			
			oldIndex = newIndex;
			
			item = this.item(newIndex);
			
		} while(!this.isSelectable(item) && available-- > 0);
		
		return this.setSelectedItem(item);
	},
	
	/**
	 * 选择当前选择项的上一项。
	 */
	selectPrev: function(){
		return this.selectNext(false);
	},
	
	/**
	 * 设置某个事件发生之后，自动选择元素。
	 */
	bindSelector: function(eventName, doToggle){
		return this.on(eventName, function(e){
			for(var c = this.first(); c; c = c.next()){
				if(c.hasChild(e.target, true)){
					this[doToggle ? "toggleSelected" : "setSelectedItem"](c);
				}
			}
		});
	}
	
}).addEvents('select change');


