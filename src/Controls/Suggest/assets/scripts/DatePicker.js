/**
 * @author 
 */



imports("Controls.Part.Icon");
using("Controls.Suggest.Picker");
using("Controls.Composite.MonthCalender");


var DatePicker = Picker.extend({
	
	dataStringFormat: 'yyyy/M/d',
	
	dropDownWidth: 'auto',
	
	menuButtonTpl: '<button class="x-button"><span class="x-icon x-icon-calendar"></span></button>',
	
	createDropDown: function(existDom){
		return new MonthCalender(existDom).on('selecting', this.selectItem, this);
	},
	
	selectItem: function (value) {
		return this.setValue(value).hideDropDown();
	},
	
	updateDropDown: function(){
		var d = new Date(this.getText());
		if(!isNaN(d.getYear()))
			this.dropDown.setValue(d);
	},
	
	getValue: function(){
		return new Date(this.getText());
	},
	
	setValue: function(value){
		return this.setText(value.toString(this.dataStringFormat));
	}

});


