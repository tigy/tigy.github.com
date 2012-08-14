/**
 * @fileOverview 提供底层的 Ajax 支持。
 */

using("System.Ajax.Base");

Ajax._send = Ajax.send;

Ajax.send = function(options) {
	assert.deprected("System.Request.Ajax 模块已过时，请使用 System.Ajax.Base 及相关的模块。");
	return Ajax._send(options);
};