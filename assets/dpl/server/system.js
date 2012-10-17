
var System = require('../../demo/demo.js');
System.Configs.physicalPath = require('path').resolve(__filename, "../../../../") + '\\';
System.Configs.nodeModules = '../../xfly/node/node_modules/';
module.exports = System;