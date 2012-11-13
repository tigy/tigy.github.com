/**
 * @author 
 */


using("Controls.Suggest.ComboBox");

/**
 * 用于提示框的组件。
 */
var Suggest = ComboBox.extend({
	
	getSuggestItems: function(text){
		if(!this.items){
			this.items = [];
			this.dropDown.child(function(item){
				this.items.push(Dom.getText(item));
			}.bind(this));
		}
		
		text = text.toLowerCase();
		return this.items.filter(function(value){
			return value.toLowerCase().indexOf(text) >= 0;
		});
	},
	
	setSuggestItems: function(value){
		this.dropDown.set(value);
		return this;
	},

	updateSuggest: function(){
	    var text = Dom.getText(this.node);
	    var items = this.getSuggestItems(text);

	    if (!items || !items.length || (items.length === 1 && items[0] === text)) {
	        return this.hideDropDown();
	    }

	    this.dropDown.set(items);
    },
	
	/**
	 * 向用户显示提示项。
	 */
	showSuggest: function(){
	    this.updateSuggest();
		this.showDropDown();
		
		// 默认选择当前值。
		this._setHover(this.dropDown.item(0));
	},
	
	onKeyUp: function(e){
		switch(e.keyCode) {
			case 40:
			case 38:
			case 13:
			case 36:
		    case 37:
		    case 27:
			    return;
		}
		
		
		this.showSuggest();
	},
	
	// 重写 onDropDownShow 和 onDropDownHide
	
	setText: Dom.prototype.setText,
	
	getText: Dom.prototype.getText,
	
	onDropDownShow: IDropDownOwner.onDropDownShow,
	
	onDropDownHide: IDropDownOwner.onDropDownHide,
	
	updateText: function(item){
		this.setText(item.getText());
	},
	
	init: function(options){
		
		var suggest = this.initDropDown().addClass('x-suggest');
		
		// UI 上增加一个下拉框。
		this.setDropDown(suggest);
		
		// 绑定下拉菜单的点击事件
		this.dropDown
			.itemOn('mouseover', this._setHover, this)
			.itemOn('mousedown', this.onItemClick, this);

		this.on('keydown', this.onKeyDown);
		this.on('focus', this.showSuggest);
		this.on('blur', this.hideDropDown);
		this.on('keyup', this.onKeyUp);
		
		this.setAttr('autocomplete', 'off');
		
	}
	
});


