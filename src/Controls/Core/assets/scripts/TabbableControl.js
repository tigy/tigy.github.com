/**
 * @author  xuld
 */

using("Controls.Core.Base");


/**
 * 表示一个可以切换的选项卡。
 */
var TabbableControl = Control.extend({
	
	onSelect: function (tab) {
		this.trigger('select', tab);
	},
	
	onChange: function () {
		this.trigger('change');
	},
	
	toggleTab: Function.empty,

	collapseDuration: 200,
	
	item: Dom.prototype.child,

	addAt: Function.empty,

	removeAt: function (index) {
	    if (this.getSelectedIndex() === index) {
	        this.setSelectedIndex(index + 1);
	    }
	    return this.removeChild(this.item(index));
	},

	add: function(title, content){
	    return this.addAt(1/0, title, content);
	},

    getSelectedTab: Function.empty,
	
	setSelectedTab: function(value){
		if(this.onSelect(value) !== false){
			this.toggleTab(this.getSelectedTab(), value, 0);
		}
		return this;
	},
	
	getSelectedIndex: function(){
		var tab = this.getSelectedTab();
		return tab ? tab.index() : -1;
	},
	
	setSelectedIndex: function(value){
	    return this.setSelectedTab(this.item(value));
	}

}).addEvents('select change');
