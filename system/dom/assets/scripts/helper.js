/** * @author  */using("System.Dom.Base");/** * 判断 2 个 Dom 对象是否相同。 * @param {Dom} other 要判断的Dom 对象。 */Dom.prototype.equals = function(other){	return other && other.dom === this.dom;};Object.each({
	attr: 0,	css: 'style',	val: 'text',	text: 0,	html: 0,	width: 0,	height: 0,	offset: 0,	position: 0,}, function(value, key) {
	value = value || key.capitalize();	var getter = Dom.prototype['get' + value];	var setter = Dom.prototype['set' + value];
	
	Dom.prototype[key] = Dom.Document.prototype[key] = function() {
		if (arguments.length === 1) {
			return getter.apply(this, arguments);
		}

		setter.apply(this, arguments);
		return this;
	};

	DomList.prototype[key] = function() {
		if (arguments.length === 1) {
			// return value.get.apply(Dom.get(this[0]), arguments);
			return this.invoke(key, arguments);
		}
		this.invoke(key, arguments);
		return this;	};});