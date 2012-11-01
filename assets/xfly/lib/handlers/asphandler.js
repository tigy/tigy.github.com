
exports.processContent = function(content, context){
	context.response.contentType = 'text/html';
	context.response.write(content);
	context.response.end();
};

exports.processRequest = require('./dynatichandler').processRequest;
