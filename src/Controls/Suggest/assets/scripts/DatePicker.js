/**
 * @author 
 */



imports("Controls.Part.Icon");
using("Controls.Suggest.Picker");
using("Controls.Composite.MonthCalender");


var DatePicker = Picker.extend({
	
	format: 'yyyy/M/d',
	
	dropDownWidth: -1,
	
	dropDownButtonTpl: '<button class="x-button"><span class="x-icon x-icon-calendar"></span></button>',
	
	createDropDown: function(existDom){
		return new MonthCalender(existDom).on('select', this.selectItem, this);
	},
	
	init: function (options) {
		Picker.prototype.init.call(this, options);
		this.input().on('focus', this.showDropDown, this);
		this.input().on('blur', this.hideDropDown, this);
	}, 
	
	selectItem: function (item) {
		this.setValue(this.dropDown.getValue());
		this.hideDropDown();
	},
	
	updateDropDown: function(){
		var d = new Date(this.getText());
		if(!isNaN(d.getYear()))
			this.dropDown.setValue(d);
	},
	
	getValue: function(){
		return this.dropDown.getValue();
	},
	
	setValue: function(value){
		this.setText(value.toString(this.format));
		this.dropDown.setValue(value);
		return this;
	}

});


