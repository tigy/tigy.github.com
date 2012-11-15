/**
 * @author xuld
 */

imports("Controls.Form.ListBox");
using("Controls.Core.ListControl");


/**
 * 表示一个列表框。
 * @extends ListControl
 */
var ListBox = ListControl.extend({

    xtype: "listbox",

    /**
     * 当选中一个值时执行。
     * @param {Dom} item 即将选中的项。
     * @protected virtual
     */
    onSelect: function (item) {
        return this.trigger('select', item);
    },

    /**
     * 当值被改变时执行。
     * @protected virtual
     */
    onChange: function () {
        this.trigger('change');
    },

    /**
     * 获取当前高亮项。
     */
    getSelectedItem: function () {
        return this.selectedItem;
    },

    /**
     * 重新设置当前高亮项。
     */
    setSelectedItem: function (item) {
        var clazz = 'x-' + this.xtype + '-hover';

        if (this.selectedItem) {
            this.selectedItem.removeClass(clazz);
        }

        this.selectedItem = item ? item.addClass(clazz) : null;
    },

    /**
	 * 移动当前选中项的位置。
	 */
    moveSelectedItem: function (next) {

        var item = this.selectedItem;

        if (item) {
            item = item[next ? 'next' : 'prev']();
        }

        if (!item) {
            item = this[next ? 'first' : 'last']();
        }

        this.setSelectedItem(item);

    },

    /**
	 * 模拟用户选择某一项。
	 */
    selectItem: function (item) {
        if (this.onSelect(item) !== false) {
            var old = this.getSelectedItem();
            this.setSelectedItem(item);

            if (!(old ? old.equals(item) : item)) {
                this.onChange();
            }
        }
    },

    /**
     * 设置当前下拉菜单的所有者。绑定所有者的相关事件。
     */
    init: function () {

        ListControl.prototype.init.apply(this, arguments);

        // 绑定下拉菜单的点击事件
        this.itemOn('mousedown', this.selectItem, this);
    }

}).addEvents('select change');



///**
// * 表示一个列表框。
// * @class
// * @extends ListControl
// * @implements IInput
// */
//var ListBox = ListControl.extend(IInput).implement({
	
//	xtype: 'listbox',
	
//	/**
//	 * 当用户点击一项时触发。
//	 */
//	onItemClick: function (item) {
//		return this.trigger('itemclick', item);
//	},
	
//	/**
//	 * 当一个选项被选中时触发。
//	 */
//	onSelect: function(item){
		
//		// 如果存在代理元素，则同步更新代理元素的值。
//		if(this.formProxy)
//			this.formProxy.value = this.baseGetValue(item);
			
//		return this.trigger('select', item);
//	},
	
//	/**
//	 * 点击时触发。
//	 */
//	onClick: function (e) {
		
//		// 如果无法更改值，则直接忽略。
//		if(this.hasClass('x-' + this.xtype + '-disabled') || this.hasClass('x-' + this.xtype + '-readonly'))
//			return;
			
//		//获取当前项。
//		var item = e.getTarget().closest('li');
//		if(item && !!this.clickItem(item)){
//			return false;
//		}
//	},
	
//	/**
//	 * 底层获取一项的值。
//	 */
//	baseGetValue: function(item){
//		return item ? item.value !== undefined ? item.value : item.getText() : null;
//	},
	
//	/**
//	 * 模拟点击一项。
//	 */
//	clickItem: function(item){
//		if(this.onItemClick(item)){
//			this.toggleSelected(item);
//			return true;
//		}
		
//		return false;
//	},
	
//	init: function(options){
//		var t;
//		if(this.node.tagName === 'SELECT'){
//			t = this.node;
//			this.node = this.create(options);
//			t.parentNode.replaceChild(this.node, t);
//		}
		
//		this.base('init');
			
//		this.on('click', this.onClick);
		
//		if(t)
//			this.copyItemsFromSelect(t);
		
//	},
	
//	// form
	
//	/**
//	 * 反选择一项。
//	 */
//	clear: function () {
//		return this.setSelectedItem(null);
//	},
	
//	/**
//	 * 获取选中项的值，如果每天项被选中，则返回 null 。
//	 */
//	getValue: function(){
//		var selectedItem = this.getSelectedItem();
//		return selectedItem ? this.baseGetValue(selectedItem) : this.formProxy ? this.formProxy.value : null;
//	},
	
//	/**
//	 * 查找并选中指定值内容的项。如果没有项的值和当前项相同，则清空选择状态。
//	 */
//	setValue: function(value){
		
//		// 默认设置为值。
//		if(this.formProxy)
//			this.formProxy.value = value;
			
//		var t;
		
//		this.each(function(item){
//			if(this.baseGetValue(item) === value){
//				t = item;
//				return false;
//			}
//		}, this);
		
//		return this.setSelectedItem(t);
//	},
	
//	copyItemsFromSelect: function(select){
//		if(select.name){
//			this.setName(select.name);
//			select.name = '';
//		}
//		for(var node = select.firstChild; node; node = node.nextSibling) {
//			if(node.tagName  === 'OPTION') {
//				var item = this.add(Dom.getText(node));
					
//				item.value = node.value;
//				if(node.selected){
//					this.setSelectedItem(item);
//				}
//			}
//		}
		
//		if(select.onclick)
//			this.node.onclick = select.onclick;
		
//		if(select.onchange)
//			this.on('change', select.onchange);
		
//	}
	
//});

