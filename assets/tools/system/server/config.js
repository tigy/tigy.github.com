

exports.root = '../../../../';
exports.data = 'assets/data';

exports.projectJs = 'project.js';
exports.buildFilesJs = 'buildfiles.js';
exports.templatesName = 'templates';

// 计算 rootPath

var Path = require("path");
var currentFilePath = require.resolve("./config");
exports.root = Path.join(Path.dirname(currentFilePath), exports.root);

exports.data = Path.join(exports.root, exports.data, '/');
exports.project = Path.join(exports.data, exports.projectJs);
exports.buildFiles = Path.join(exports.data, exports.buildFilesJs);
exports.templates = Path.join(exports.data, exports.templatesName);

   //   console.log(  exports );