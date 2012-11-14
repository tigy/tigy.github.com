/**
 * @author xuld
 */



imports("Controls.Form.ListBox");
using("Controls.Core.ListControl");
using("Controls.Suggest.Picker");

/**
 * 表示一个组合框。
 * @class
 * @extends Picker
 * @example <pre>
 * var comboBox = new ComboBox();
 * comboBox.add("aaa");
 * comboBox.add("bbb");
 * comboBox.setSelectedIndex(0);
 * </pre>
 */
var ComboBox = Picker.extend({
	
    xtype: 'combobox',
	
    autoResize: true,
	
    // 悬停选中
	
    _getHover: function(){
        return this._hoverItem;
    },
	
    _setHover: function(item){
        var clazz = 'x-' + this.dropDown.xtype + '-hover';
		
        if(this._hoverItem){
            this._hoverItem.removeClass(clazz);
        }
		
        this._hoverItem = item ? item.addClass(clazz) : null;
		
    },
	
    /**
	 * 移动当前选中项的位置。
	 */
    _moveHover: function(delta){
		
        // 如果菜单未显示。
        if(this.dropDownHidden()){
	    	
            // 显示菜单。
            this.showDropDown();
        } else {
	    	
            var item = this._hoverItem || this.selectedItem;
	    	
            if(item){
                item = item[delta > 0 ? 'next' : 'prev']();
            }
	    	
            if(!item){
                item = this.dropDown.item(delta > 0 ? 0 : -1);
            }
	    	
            this._setHover(item);
	    	
        }
    },
	
    onSelect: function(item){
        return this.trigger('select', item);
    },
	
    onChange: function(){
        this.trigger('change');
    },
	
    /**
	 * 处理键盘事件。
	 */
    onKeyDown: function (e) {
        switch(e.keyCode) {
			
            // 上下
            case 40:
            case 38:
			
                // 阻止默认事件。
                e.preventDefault();
			    
                this._moveHover(e.keyCode === 40 ? 1 : -1);
			    
                break;
			    
                // 回车
            case 13:
            case 10:
                if(!this.dropDownHidden()){
                    var currentItem = this._getHover();
                    if(currentItem != null) {
                        this.selectItem(currentItem);
                        e.preventDefault();
                    }
                }

            // ESC
            case 27:
                this.hideDropDown();
                break;

        }
    },
	
    /**
	 * 当用户单击某一项时执行。
	 */
    onItemClick: function(item){
	
        // 如果无法更改值，则直接忽略。
        if(!this.getAttr('disabled') && !this.getAttr('readonly')) {
	        
            // 设置当前的选中项。
            this.selectItem(item);
			
        }

        return false;
		
    },
	
    /**
	 * 创建当前 Picker 的菜单。
	 * @return {Control} 下拉菜单。
	 * @protected virtual
	 */
    initDropDown: function(existDom){
        return new ComboBox.DropDownMenu(existDom);
    },
	
    /**
	 * 将当前文本的值同步到下拉菜单。
	 */
    updateDropDown: function(){
        this._setHover(this.getSelectedItem());
    },

    init: function (options) {
		
        // 1. 处理 <select>
        var selectNode;
		
        // 如果初始化的时候传入一个 <select> 则替换 <select>, 并拷贝相关数据。
        if(this.node.tagName === 'SELECT') {
			
            this.inputProxy = selectNode = new Dom(this.node);
			
            // 调用 create 重新生成 dom 。
            this.node = Dom.parseNode(this.dropDownListTpl);
			
            this.dropDownList = true;
			
        }
		
        // 2. 初始化文本框
		
        // 初始化文本框
        this.base('init');
		
        // 3. 初始化菜单
		
        // 绑定下拉菜单的点击事件
        this.dropDown
			.itemOn('mouseover', this._setHover, this)
			.itemOn('click', this.onItemClick, this);
		
        // 4. 绑定事件
		
        // 监听键盘事件。
        this.on('keydown', this.onKeyDown);
		
        // IE6 Hack: keydown 无法监听到回车。
        if(navigator.isIE6) {
            this.on('keypress', this.onKeyDown);	
        }
		
        // 4. 设置默认项
			
        if(selectNode) {
			
            // 让 listBox 拷贝 <select> 的成员。
            this.copyItemsFromSelect(selectNode);
			
            // 隐藏 <select> 为新的 dom。
            selectNode.hide();

            // 插入当前节点。
            selectNode.after(this);
        }
		
    },
	
    setText: function (value) {

        // 如果是 dropDownList 模式，则通过 setSelectedItem 来设置当前文本框的值。
        if (this.dropDownList) {

            // 设置 value 。
            this.input().node.value = value;

            // 根据 value 获得新决定的选中项设置选中项。
            return this.setSelectedItem(this.getSelectedItem());
        }

        // 设置内容。
        return IInput.setText.call(this, value);
            
    },
	
    /**
	 * 模拟用户选择某一个项。
	 */
    selectItem: function (item) {
        
        if (this.onSelect(item) !== false) {
        	
        	var changed, old;
        	
        	// 如果是列表形式，判断选中项。
        	if (this.dropDownList) {
        		old = this.getSelectedItem();
            	this.setSelectedItem(item);
            	changed = !(old ? old.equals(item) : item);
        	} else {
        		old = this.getText();
            	this.setSelectedItem(item);
            	changed = this.getText() !== old;
        	}
        	
        	if(changed){
        		this.onChange();
        	}
        }

        return this.hideDropDown();
    },

    getValueOfItem: function (item) {
        assert.notNull(item, "ComboBox#getValueOfItem(item): {item} ~", item);
        var option = item.dataField().option;
        return option ? option.value : (item.getAttr('data-value') || item.getText());
    },
	
    /**
	 * 获取当前选中的项。如果不存在选中的项，则返回 null 。
	 * @return {Control} 选中的项。
	 */
    getSelectedItem: function () {

        // 如果使用了表单模式，则优先查找 value 匹配的项。
        if (this.dropDownList) {

            // 获取 input 字段。
            var input = this.input(), value;

            // 如果隐藏域是 SELECT ，比较方便：
            if (input.node.tagName === 'SELECT') {
                value = this.inputProxy.getAttr('selectedIndex');
                return value >= 0 ? this.dropDown.item(value) : null;
            }

            value = input.node.value;

            return this.dropDown.child(function (dom) {
                return this.getValueOfItem(new Dom(dom)) === value;
            }.bind(this));
        }

        value = this.getText();
        return this.dropDown.child(function (dom) {
            return Dom.getText(dom) === value;
        });
    },
	
    /**
	 * 设置当前选中的项。
	 * @param {Control} item 选中的项。
	 * @return this
	 */
    setSelectedItem: function (item) {

        // 如果有隐藏域，则设置选择的索引。
        if (this.dropDownList) {

            var text,
                input = this.input();

            if (input.node.tagName === "SELECT") {

                if (item) {
                    var option = item.dataField().option;
                    if (!option) {
                        item.dataField().option = option = new Option(item.getText(), this.getValueOfItem(item));
                        input.node.add(option);
                    }
                    option.selected = true;
                    text = Dom.getText(option);
                } else {
                    input.node.selectedIndex = -1;
                    text = input.getAttr('placeholder');
                }

            } else {
                input.node.value = item ? this.getValueOfItem(item) : "";
                text = item ? item.getText() : "";
            }

            // 无隐藏域，仅设置按钮的文本。
            this.first().setText(text);

        } else {

        	// 如果未使用表单模式，则设置当前文本框。
            // 获取 item 的文本并更新值。
            this.setText(item ? item.getText() : "");
        }
        
    },
	
    getSelectedIndex: function(){
        return this.dropDown.indexOf(this.getSelectedItem());
    },
	
    setSelectedIndex: function(value){
        return this.setSelectedItem(this.dropDown.item(value));
    },

    // select
	
    resizeToFitItems: function(){
        var dropDown = this.dropDown,
			oldWidth = dropDown.getStyle('width'),
			oldDisplay = dropDown.getStyle('display');
			
        dropDown.setStyle('display', 'inline-block');
        dropDown.setWidth('auto');
		
        this.first().setSize(dropDown.getWidth());
		
        dropDown.setStyle('width', oldWidth);
        dropDown.setStyle('display', oldDisplay);
        return this;
    },
	
    copyItemsFromSelect: function(select) {
		
        this.dropDown.empty();
		
        for(var node = select.node.firstChild; node; node = node.nextSibling) {
            if(node.tagName  === 'OPTION') {
                var item = this.dropDown.add(Dom.getText(node));
				
                item.dataField().option = node;
                if(node.selected){
                    this.setSelectedItem(item);
                }
            }
        }
		
        if(select.node.onclick)
            this.node.onclick = select.node.onclick;
		
        if(select.node.onchange)
            this.on('change', select.node.onchange);
		
        if(this.autoResize)
            this.setWidth(select.getWidth());
        
        if(select.getAttr('disabled')) {
            this.setAttr('disabled', true);
        }

        if (select.getAttr('readonly')) {
            this.setAttr('readonly', true);
        }
		
    }

}).addEvents('select change');


ListControl.aliasMethods(ComboBox, 'dropDown');


ComboBox.DropDownMenu = ListControl.extend({
	
});