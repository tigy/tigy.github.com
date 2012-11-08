

function writeJsonp(context, data) {

    data = JSON.stringify(data);

    if (context.request.queryString.callback) {
        context.response.write(context.request.queryString.callback + '(' + data + ')');
    } else {
        context.response.write(data);
    }

}

function redirect(context, url) {

    url = url || context.request.queryString.postback;

    if (url) {

        if (/^file:\/\/\//.test(url)) {
            url = url.replace(/^file:\/\/\//, '');
            var System = require('./system');
            url = url.replace(System.Configs.physicalPath.replace(/\\/g, "/"), System.Configs.rootUrl);
            context.response.redirect(url);

        } else {
            context.response.redirect(url);
        }

    }

}


exports.writeJsonp = writeJsonp;
exports.redirect = redirect;