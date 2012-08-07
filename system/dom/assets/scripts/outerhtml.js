/** * @author  */

getOuterHtml: function(value) {
	if ("outerHTML" in this) {
		return this.outerHTML;
	} else {
		var div = Dom.getDocument(this.dom).createElement('div')
		div.appendChild(this.clone().dom);
		return div.innerHTML;
	}
},

setOuterHtml: function(value){
	if ("outerHTML" in this && !/<(?:script|style|link)/i.test(value)) {
		this.outerHTML = value;
	} else {
		this.before(value);
		this.remove();
	}

	return this;
},