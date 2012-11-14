/**
 * @author xuld
 */

using("System.Dom.KeyNav");
using("Controls.Suggest.DropDownMenu");
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
    createDropDown: function(existDom){
        return new DropDownMenu(existDom);
    },
	
    /**
	 * 将当前文本的值同步到下拉菜单。
	 */
    updateDropDown: function(){
        this.dropDown.setHovering(this.getSelectedItem());
    },

    onUpDown: function (next) {
    
        // 如果菜单未显示。
        if (this.dropDownHidden()) {

            // 显示菜单。
            this.showDropDown();
        } else {
            this.dropDown.handlerUpDown(next);
        }
    },
    
    onEnter: function(){
    	if (this.dropDownHidden()) {
            return true;
        }
        
        // 交给下列菜单处理。
        this.dropDown.handlerEnter();
    },
	
    init: function (options) {
		
        // 1. 处理 <select>
        var selectDom;
		
        // 如果初始化的时候传入一个 <select> 则替换 <select>, 并拷贝相关数据。
        if(this.node.tagName === 'SELECT') {
			
            this.selectDom = selectDom = new Dom(this.node);
			
            // 调用 create 重新生成 dom 。
            this.node = this.create();
			
        }
		
        // 2. 初始化文本框
		
        // 初始化文本框
        this.base('init');
		
        // 3. 设置默认项
			
        if(selectDom) {
			
            // 让 listBox 拷贝 <select> 的成员。
            this.copyItemsFromSelect(selectDom);
			
            // 隐藏 <select> 为新的 dom。
            selectDom.hide();

            // 插入当前节点。
            selectDom.after(this);
        }
		
        // 4. 和下拉菜单互相绑定
		
        // 监听键盘事件。
        this.keyNav({
    	
            up: function () {
                this.onUpDown(false);
            },

            down: function () {
                this.onUpDown(true);
            },

            enter: this.onEnter,

            esc: function(){
            	this.hideDropDown();
            }

       	});
            
        // 设置智能提示项选择后的回调。
        this.dropDown.on('select', this.selectItem, this);
		
    },
	
    /**
	 * 模拟用户选择某一个项。
	 */
    selectItem: function (item) {
    	
    	var old = this.getText();
    	this.setSelectedItem(item);
    	if(old !== this.getText()) {
    		this.trigger('change');
    	}

        return this.hideDropDown();
    },
	
    /**
	 * 获取当前选中的项。如果不存在选中的项，则返回 null 。
	 * @return {Control} 选中的项。
	 */
    getSelectedItem: function () {
        var value = this.getText();
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
        return this.setText(item ? item.getText() : "");
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

});

ListControl.aliasMethods(ComboBox, 'dropDown');

