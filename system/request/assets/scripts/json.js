//===========================================
//  请求处理JSON数据            
//   A: xuld
//===========================================

using("System.Request.Text");

Request.JSON = Request.Text.extend({
	
	/**
	 * 获取请求头。
	 */
	headers: Object.extendIf({
		'Accept': 'application/json'
	}, Request.Text.prototype.headers),
	
	parseJSON: function(response){
		return eval("(" + response + ")");
	},
	
	getContent: function (xhr) {
		return this.parseJSON(xhr.responseText);
	}

});
