/**
 * @author  xuld
 */

using("Controls.Core.Base");


/**
 * 表示一个可以切换的选项卡。
 * @abstract
 * @extends Control
 */
var TabbableControl = Control.extend({

	collapseDuration: 200,
	
	item: Dom.prototype.child,

	add: function (title, content) {
	    return this.addAt(1 / 0, title, content);
	},

	addAt: Function.empty,

    /**
     * 当被子类重写时，实现选项卡切换逻辑。
     * @param {Dom} to 切换的目标选项卡。
     * @param {Dom} from 切换的源选项卡。
     * @param {Function} callbacl 切换完成后的回调函数。
     * @protected abstract
     */
	baseToggleTab: Function.empty,

	removeAt: function (index) {
	    if (this.getSelectedIndex() === index) {
	        this.setSelectedIndex(index + 1);
	    }
	    return this.removeChild(this.item(index));
	},

	selectTab: function (value) {	    var me = this, old;	    if (me.trigger('selecting', value) !== false) {
	        old = me.getSelectedTab();	        me.baseToggleTab(old, value);	        if(!(old ? old.equals(value) : value)){	            me.trigger('change');	        }	    }	    return me;	},

    getSelectedTab: Function.empty,
	
    setSelectedTab: function (value) {
        this.baseToggleTab(this.getSelectedTab(), value);
		return this;
	},
	
	getSelectedIndex: function(){
		var tab = this.getSelectedTab();
		return tab ? tab.index() : -1;
	},
	
	setSelectedIndex: function(value){
	    return this.setSelectedTab(this.item(value));
	}

}).addEvents('change');
