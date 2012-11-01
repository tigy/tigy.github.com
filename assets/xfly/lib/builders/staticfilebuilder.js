

var IO = require('io');


exports.build = function(from, to, builder){
	IO.copyFile(from, to);
	return true;
};
