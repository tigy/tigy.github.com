/**
 * @author  xuld
 */

imports("Controls.Button.Button");
using("Controls.Core.IInput");
using("Controls.Core.ContentControl");




var Button = ContentControl.extend({
	
	xtype: 'button',
	
	type: 'button',
	
	tpl: '<button class="x-control" type="button"></button>',
	
	create: function(options){
		return Dom.parseNode(this.tpl.replace(/x-control/g, 'x-' + this.xtype).replace('type="button"', 'type="' + (options.type || this.type) + '"'));
	},
	
	setAttr: function (name, value) {
		if(/^disabled$/i.test(name)){
			return this.disabled(value);
		}
		return Dom.prototype.setAttr.call(this, name, value);
	},
	
	actived: function(value){
		return this.toggleClass('x-button-actived', value !== false);
	},
	
	disabled: function (value) {
	    value = value !== false;
	    this.toggleClass('x-' + this.xtype + '-disabled', value);
	    return Dom.prototype.setAttr.call(this, 'disabled', value);
	}
	
});

