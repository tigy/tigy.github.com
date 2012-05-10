



Dom.addEvent('ctrlenter', {
	
	add: function(ctrl, type, fn){
		Dom.$event.$default.add(ctrl, 'keypress', fn);
	},

	remove: function(ctrl, type, fn){
		Dom.$event.$default.remove(ctrl, 'keypress', fn);
	},

	initEvent: function(e){
		return e.ctrlKey && (e.which == 13 || e.which == 10);
	}
	
});

Dom.submitOnCtrlEnter = function (dom, check) {
	Dom.get(dom).on('ctrlenter', function () {
		if((!check || check(this.value) !== false) && this.dom.form)
			this.form.submit();
	});
};