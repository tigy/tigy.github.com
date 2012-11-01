/**
 * @author 
 */



imports("Controls.Tab.Accordion");
using("Controls.Core.TabbableControl");


var Accordion = TabbableControl.extend({
	
	/**
	 * xtype
	 * @type String
	 */
	xtype: 'accordion',
	
	tpl: '<div class="x-control"></div>',

	itemTpl: '<div class="x-accordion-panel x-accordion-collapsed">\
                    <div class="x-accordion-header">\
                        <a href="javascript:;">{title}</a>\
                    </div>\
                    <div class="x-accordion-body">\
                        <div class="x-accordion-content">{content}</div>\
                    </div>\
                </div>',

	addAt: function (index, title, content) {
	    return this.insertBefore(Dom.parse(this.itemTpl.replace("{title}", title).replace("{content}", content)), this.child(index));
	},
	
	toggleTab: function(from, to){
		
		var me = this, trigger = 2;
		
		if(from) {
			if(to && from.node === to.node) {
				return;
			}
			
			from.removeClass('x-accordion-collapsed').last().hide('height', this.collapseDuration, callback);
		} else
			callback();
		
		if(to)
		    to.removeClass('x-accordion-collapsed').last().show('height', this.collapseDuration, callback);
		else
			callback();
			
		function callback(){
			if(--trigger <= 0){
				if(from)
					from.addClass('x-accordion-collapsed');
				me.onChange();
			}
		}
		
	},
	
	getSelectedTab: function(){
		return this.find('.x-accordion-panel:not(.x-accordion-collapsed)');
	},
	
	init:function(options){
		var me = this;
		this.delegate('>.x-accordion-header', options.selectEvent || 'click', function() {
			me.setSelectedTab(this.parent());
		});
		
		var selecedTab = me.getSelectedTab();
		
		this.query('>.x-accordion-panel').addClass('x-accordion-collapsed');
		
		if(selecedTab)
			selecedTab.removeClass('x-accordion-collapsed');
			
	}
	
});