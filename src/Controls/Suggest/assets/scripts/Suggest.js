/**
 * @author xuld
 */


using("System.Dom.KeyNav");
using("Controls.Core.IDropDownOwner");
using("Controls.Suggest.DropDownMenu");

/**
 * 智能提示组件。
 */
var Suggest = Control.extend(IDropDownOwner).implement({

    dropDownWidth: -1,

    /**
	 * 创建当前 Suggest 的菜单。
	 * @return {Dom} 下拉菜单。
	 * @protected virtual
	 */
    createDropDown: function () {
        return new DropDownMenu().addClass('x-suggest');
    },

    /**
	 * 更新智能提示菜单的状态。
     * @protected override
	 */
    showSuggest: function () {		
	    var text = this.getText();
	    var items = this.getSuggestItems(text);

        // 如果智能提示的项为空或唯一项就是当前的项，则不提示。
	    if (!items || !items.length || (items.length === 1 && items[0] === text)) {
	        return this.hideDropDown();
	    }

	    this.dropDown.set(items);

        // 默认选择当前值。
        this.dropDown.setHovering(this.dropDown.item(0));
	    return this.showDropDown();
    },

	hideSuggest: function(){
		return this.hideDropDown();
	},

    onUpDown: function (next) {    
        // 如果菜单未显示。
        if (this.dropDownHidden()) {

            // 显示菜单。
            this.showSuggest();
        } else {
            this.dropDown.handlerUpDown(next);        }    },
    
    onEnter: function(){
    	if (this.dropDownHidden()) {
            return true;
        }
        
        // 交给下列菜单处理。
        this.dropDown.handlerEnter();
    },
	
    init: function(options){
		
        // 关闭原生的智能提示。
        this.setAttr('autocomplete', 'off')
        	
        	// 创建并设置提示的下拉菜单。
        	.setDropDown(this.createDropDown())
			
			// 获取焦点后更新智能提示显示状态。
            .on('focus', this.showSuggest)
            
            // 失去焦点后隐藏菜单。
            .on('blur', this.hideSuggest)
			
			// 绑定一些事件。
            .keyNav({

                up: function () {
                    this.onUpDown(false);                },

                down: function () {
                    this.onUpDown(true);
                },

                enter: this.onEnter,

                esc: this.hideSuggest,

                other: this.showSuggest

            });
            
        // 设置智能提示项选择后的回调。
        this.dropDown.onSelect = this.selectItem.bind(this);
		
    },

    /**
     * 根据当前的文本框值获取智能提示的项。
     */
	getSuggestItems: function(text){
	    if (!text) {
	        return this.suggestItems;
	    }

		text = text.toLowerCase();
		return this.suggestItems.filter(function (value) {
			return value.toLowerCase().indexOf(text) >= 0;
		});
	},
	
    /**
     * 强制设置当前选中的项。
     */
	setSuggestItems: function(value){
	    this.suggestItems = value || [];
		return this;
	},

    /**
     * 模拟用户选择一项。
     */
	selectItem: function (item) {	    if (item) {
	        this.setText(item.getText());	    }	    return this.hideDropDown();	}
	
});
