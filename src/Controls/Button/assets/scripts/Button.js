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
	
}).implement(IInput);

