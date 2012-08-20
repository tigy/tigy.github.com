




var MySplitButton = SplitButton.extend({
	
	menuWidth: -1,
	
	init: function () {
		this.container = this.find('.x-button');
		this.menuButton = this.find('.x-button:last-child');
		this.menuButton.on('click', this.toggleMenu, this);
		
		this.setMenu(this.next('.button-menu'));
		this.menuButton.appendTo(this.node);
		this.items = this.controls = this.menu.controls;
	}
	
});



Dom.ready(function(){
	Dom.query('.x-splitbutton').each(function(value){
		new MySplitButton(value);
	});
});


var CodeHelper = {
	
	getValue: function(){
		return Dom.get('code').getText();
	},
	
	setValue: function(value){
		Dom.get('code').setText(value);
	},
	
	setInfo: function(value){
		Dom.get('info').setHtml(value);
	},
	
	format: function(){
		var value = this.getValue();
		
		var indent = Dom.get('format-indent').getText(),
			indent_char = '\t',
			indent_size = 1;
		switch(+indent){
			case 1:
				break;
			case 2:
				indent_char = ' ';
				indent_size = 2;
				break;
			case 3:
				indent_char = ' ';
				indent_size = 4;
				break;
			case 4:
				indent_char = ' ';
				indent_size = 6;
				break;
		}
		
		if(/^\s*\</.test(value)){
			value = Demo.formatHTML(value, indent_char, indent_size);
		} else {
			
			value = Demo.formatJS(value, {
				indent_size: indent_size,
				indent_char: indent_char,
				preserve_newlines: Dom.get('format-preserve-newlines').getAttr('checked')
			});
			
		}
		
		this.setValue(value);
	},

	obfuscator: function (deobfuscator) {
		var value = this.getValue();
		
		var oldValue = value;
		
		if(deobfuscator){
			if(/^eval\b/.test(value)){
				value = eval(value.substring(4));
			}
		} else {
			value = pack(value, Dom.get("obfuscator-ascii-encoding").getText(), Dom.get("obfuscator-fast-decode").getAttr('checked'), Dom.get("obfuscator-special-chars").getAttr('checked'));
		}
			
		this.setValue(value);
		this.setInfo(String.format("compression ratio: {0}/{1} = {2}%", value.length, oldValue.length, (value.length * 100 / oldValue.length).toFixed(3)));
	  
	},
	
	packer: function(){
		
		var value = this.getValue();
		
		var oldValue = value;
		
		
		
		var packer = new Packer;
		value = packer.pack(value, Dom.get('packer-base62').getAttr('checked'), Dom.get('packer-shrink').getAttr('checked'));
		
		
	
		this.setValue(value);
		this.setInfo(String.format("compression ratio: {0}/{1} = {2}%", value.length, oldValue.length, (value.length * 100 / oldValue.length).toFixed(3)));
	  
	
	
	},
	
	string: function(){
		
		var value = this.getValue();
		var firstChar = value.charAt(0);
		
		function html2js(value) {
			value = value.replace(/^\s+|\s+$/g, '').replace(/\n/g, "\\\n").replace(/'/g, "\\'");
			return "'" + value + "'";
		}
		
		function js2html(value) {
			return value.replace(/\\\n/g, "\n").replace(/\\'/g, "'").replace(/^'|^"|'$|"$/g, "");
		}
		
		if(value === '"' || firstChar === "'"){
			value = js2html(value);
		} else {
			value= html2js(value);	
		}
		
		
		this.setValue(value);
	},
	
	jjencode: function(){
		
		var value = this.getValue();

		value = jjencode( Dom.get('jjencode-varname').getText(), value );
		if(  Dom.get('jjencode-palindrome').getAttr('checked') ){
			value = value.replace( /[,;]$/, "" );
			value = "\"\'\\\"+\'+\"," + value + ",\'," + value.split("").reverse().join("") +",\"+\'+\"\\\'\"";
		}
		
		
		this.setValue(value);
	},
	
	encode: function(){
		
		var value = this.getValue();
		
		value = encodeURIComponent(value);  
		
		this.setValue(value);
		
	},
	
	decode: function(){
		
		var value = this.getValue();
		
		value = decodeURIComponent(value);  
		
		this.setValue(value);
		
	}

};