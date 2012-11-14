/**
 * @author xuld
 */


using("System.Dom.KeyNav");
using("Controls.Core.IDropDownOwner");
using("Controls.Form.ListBox");

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
        return new ListBox().addClass('x-suggest');
    },

    /**
	 * 刷新智能提示。
     * @protected override
	 */
    showSuggest: function () {        this.updateSuggestItems();

        // 默认选择当前值。
        this.dropDown.setSelectedItem(this.dropDown.item(0));
    },

    hideSuggest: function () {        this.hideDropDown();    },

    moveSelectedItem: function (next) {    
        // 如果菜单未显示。
        if (this.dropDownHidden()) {

            // 显示菜单。
            this.showSuggest();
        } else {
            this.dropDown.moveSelectedItem(next);        }    },
	
    init: function(options){
		
        // UI 上增加一个下拉框。
        this.setDropDown(this.createDropDown());
		
        // 关闭原生的智能提示。
        this.setAttr('autocomplete', 'off');

        // 绑定选中事件。
        this.dropDown
            .itemOn('mouseover', this.dropDown.setSelectedItem, this.dropDown)
			.on('select', this.selectItem, this);

        this
            .on('focus', this.showSuggest)
            .on('blur', this.hideSuggest)

            .keyNav({

                up: function () {
                    this.moveSelectedItem(false);                },

                down: function () {
                    this.moveSelectedItem(true);
                },

                enter: function () {
                    if (this.dropDownHidden()) {
                        return true;
                    }
                    this.selectItem(this.dropDown.getSelectedItem());
                },

                esc: this.hideSuggest,

                other: this.showSuggest

            });
		
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
     * 更新智能提示的项。
     */
	updateSuggestItems: function () {
        
	    var text = this.getText();
	    var items = this.getSuggestItems(text);

        // 如果智能提示的项为空或唯一项就是当前的项，则不提示。
	    if (!items || !items.length || (items.length === 1 && items[0] === text)) {
	        return this.hideDropDown();
	    }

	    this.dropDown.set(items);
	    return this.showDropDown();
	},

    /**
     * 模拟用户选择一项。
     */
	selectItem: function (item) {	    if (item) {
	        this.setText(item.getText());	    }	    return this.hideDropDown();	}
	
});