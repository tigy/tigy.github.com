
exports.processRequest = function (context) {
    context.response.contentType = 'text/html; charst=UTF-8';
    if (context.response.statusCode) {
        switch (context.response.statusCode) {
            case 404:
                context.response.write('<!doctype><html><head><title>' + context.error.path + '</title></head><body><pre>Not Found: ' + context.error.path + '</pre></body></html>');
                break;
            case 403:
                context.response.write('<!doctype><html><head><title>' + context.error.path + '</title></head><body><pre>Not Allowed: ' + context.error.path + '</pre></body></html>');
                break;
            default:
                context.response.write(context.error);
                break;
        }
	} else {
		context.response.statusCode = 500;
		context.response.write(context.error);
		console.log(context.error.stack);	
	}
	context.response.end();
};
