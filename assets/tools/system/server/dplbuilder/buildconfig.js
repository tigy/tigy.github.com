

var BuildConfig = {
	
	rootPath: require("../config").root,	
	
	sourceEncoding: 'utf-8',
	
	encoding: 'utf-8',
	
	lineBreak: '\r\n',
	
	removeUsing: true,
	
	removeImports: true,
	
	removeTrace: true,
	
	removeAssert: false,
	
	removeConsole: false,
	
	copyImages: true,
	
	resolveLess: true,
	
	header: true,
	
	macro: true,
	
	resolveNamespace: function(namespace, isStyle){
		
		if(namespace.indexOf('/') >= 0){
			return 	namespace;
		}
		
		namespace = namespace.toLowerCase();
		
		var asset;
		
		if(isStyle){
			asset = this.rootPath + namespace.replace(/^([^.]+\.[^.]+)\./, '$1.assets.styles.').replace(/\./g, '/') ;
			
			if(this.exists(asset+ '.less')) {
				return asset+ '.less';
			}
			
			if(this.exists(asset+ '.css')) {
				return asset+ '.css';
			}
			
			asset = this.rootPath + namespace.replace(/\./g, '/');
			
			if(this.exists(asset+ '.less')) {
				return asset+ '.less';
			}
			
			asset = asset + '.css';
			
		} else {
			asset = this.rootPath + namespace.replace(/^([^.]+\.[^.]+)\./, '$1.assets.scripts.').replace(/\./g, '/') + '.js';	
			
			if(this.exists(asset)) {
				return asset;
			}
		
			asset = this.rootPath + namespace.replace(/\./g, '/') + '.js';
			
		}
		
		
		return asset;
	},

	resolveRefs: function(namespace, isStyle){
		
		var content = this.getContent(namespace, isStyle), r = {
			
			css: [],
			
			js: []
			
		};
		
		if(isStyle) {
				
			
			content.replace(/(^\s*|#)(using|imports)\b(.+)\*\/\s*$/mg, function(m, c1, type, c3){
				var value = c3.replace(/^[\s\("']+|[\s\)'";]+$/g, "");
				
				r.css.push(value);
				
				if(type === 'using')
					r.js.push(value);
				
			});
			
		} else {
			
			content.replace(/(^\s*|#)(using|imports)\b(.+)$/mg, function(m, c1, type, c3){
				var value = c3.replace(/^[\s\("']+|[\s\)'";]+$/g, "");
				
				r.css.push(value);
				
				if(type === 'using')
					r.js.push(value);
				
			});
			
			
		}
		
		return r;
		
		
	},
	
	resolveMacro: function(content, define){
        		
		var m = /^\/\/\/\s*#(\w+)(.*?)$/m;
		
		var r = [];
		
		while(content) {
			var value = m.exec(content);
			
			if(!value){
				r.push([content, 0, 0]);
				break;
			}
			
			// 保留匹配部分的左边字符串。
			r.push([content.substring(0, value.index), 0, 0]);
			
			r.push(value);
			
			// 截取匹配部分的右边字符串。
			content = content.substring(value.index + value[0].length);
		}
		
		
		//console.log(r);
		
		var codes = ['var $out="",$t;'];
		
		r.forEach(function(value, index){
			
			if(!value[1]){
				codes.push('$out+=$r[' + index + '][0];');
				return;
			}
			
			var v = value[2].trim();
			
			switch(value[1]){
					
				case 'if':
					codes.push('if(' + v.replace(/\b([a-z_$]+)\b/ig, "$d.$1") +'){');
					break;
					
				case 'else':
					codes.push('}else{');
					break;
					
				case 'elsif':
					codes.push('}else if(' + v.replace(/\b([a-z_$]+)\b/g, "$d.$1") +'){');
					break;
					
				case 'endif':
				case 'endregion':
					codes.push('}');
					break;
					
				case 'define':
					var space = v.search(/\s/);
					if(space === -1){
						codes.push('if(!(' + v + ' in $d))$d.'+v+"=true;");
					} else {
						codes.push('$d.'+v.substr(0,space) +"=" + v.substr(space) + ";");
					}
					break;
					
				case 'undef':
					codes.push('delete $d.'+v+";");
					break;
					
				case 'ifdef':
					codes.push('if(' + v+' in $d){');
					break;
					
				case 'ifndef':
					codes.push('if(!(' + v+' in $d)){');
					break;
					
				case 'region':
					codes.push('if($d.' + v+' !== false){');
					break;
					
				case 'rem':
					break;
				
				default:
					codes.push('$out+=$r[' + index + '][0];');
					break;
			}
			
		});
		
		codes.push('return $out;');
		
	//	console.log(codes.join(''));
		
		var fn = new Function("$r", "$d", codes.join(''));
		
		return fn(r, define);
	},
	
	resolveJsFile: function(content, path){
		
		if(this.macro) {
			var define = {};
		
			this.define && this.define.split(';').forEach(function(value){
				define[value.trim()]  = true;
			});
			try {
				content = this.resolveMacro(content, define);
			} catch(e){
				this.error('Macro Parse Error: ' + e.message + '. (' + path + ')');
			}
		}
		
		if(this.removeUsing){
			content = content.replace(/^\s*using\s*\(.*?$/mg, "");
		}
		
		if(this.removeImports){
			content = content.replace(/^\s*imports\s*\(.*?$/mg, "");
		}
		
		if(this.removeTrace){
			content = content.replace(/^\s*trace\s*[\(\.].*?$/mg, "");
		}
		
		if(this.removeAssert){
			content = content.replace(/^\s*assert\s*[\(\.].*?$/mg, "");
		}
		
		if(this.removeConsole){
			content = content.replace(/^\s*console\s*\..*?$/mg, "");
		}
		
		return content;
	},
	
	resolveCssFile: function(content, path, name){
		
		if(this.resolveLess && /\.less$/.test(path)){
			if(!less)
				initLess(this);
			
			var parser = new less.Parser({
			    filename:  path // Specify a filename, for better error messages
			});
			
			var me = this;
			
			parser.parse(content, function (e, tree) {
				try{
			    content =tree.toCSS({ compress: false }); // Minify CSS output
			  }catch(e) {
			  	 me.error('Less Parse Error: ' + e.message + '. (' + path + ')');
			  }
			});
			
		}
		
		
		if(this.copyImages) {
			var Path = require("path");
			var f = Path.dirname(path);
			
			//  目标 图片文件夹
			var targetImages = Path.join(this.targetImages, getParentName(name));
			var p = Path.join(Path.dirname(this.targetCss), targetImages);
			var me = this;
			
			content = content.replace(/url\s*\((['""]?)(.*)\1\)/ig, function(all, c1, c2, c3){
				if(c2.indexOf(':') >= 0)
					return all;
				
				var src = Path.join(f, c2);
				var destName = Path.basename(c2);
				
				if(!me.images[src]) {
                    me.images[src] = true;
                    
                    if(!me.exists(src)){
                    	me.error('Can\'t Find "' + src + '". (' + path + ')');
                    	
                    	return  all;
                    }
					
                    require("../lib/io").copyFileAndOverwrite(src, Path.join(p, destName));
                }
                return "url(" + Path.join(targetImages, destName).replace(/\\/g, "/") + ")";
			});
		}
		
		return content;
	},
	
	writeGlobalHeader: function(writer){
		var d = new Date();
		d = [d.getFullYear(), '/', d.getMonth() + 1, '/', d.getDate(), ' ', d.getHours(), ':', d.getMinutes()].join('');
		this.writeHeader(writer, "This file is created by a tool at " + d);
		writer.write(this.lineBreak);
		writer.write(this.lineBreak);
		writer.write(this.lineBreak);
	},
	
	writeHeader: function(writer, name){
		writer.write(this.lineBreak);
		writer.write("/*********************************************************");
		writer.write(this.lineBreak);
        writer.write(" * ");
        writer.write(name + this.lineBreak);
        writer.write(" *********************************************************/");
		writer.write(this.lineBreak);
	},
	
	writeContent: function(writer, content){
		writer.write(content);
	},
	
	oninit: function(){
		this.images = {};
	}
	
	
};

var less;

function initLess(builder){
	less = require('../../../less');
	
	var path = require("path")   ;
	
	less.Parser.importer = function (file, paths, callback, env) {
    var pathname;
    // TODO: Undo this at some point,
    // or use different approach.
    paths.unshift('.');
    paths.unshift(path.dirname(env.filename));

    for (var i = 0; i < paths.length; i++) {
        pathname = path.join(paths[i], file);

        if(builder.exists(pathname)){
        	break;
        }
    }

    if (pathname) {
    	var data = builder.read(pathname);
        new(less.Parser)({
            paths: [path.dirname(pathname)].concat(paths),
            filename: pathname
        }).parse(data, function (e, root) {
            callback(e, root, data);
        });
    } else {
        if (typeof(env.errback) === "function") {
            env.errback(file, paths, callback);
        } else {
            callback({ type: 'File', message: "'" + file + "' wasn't found.\n" });
        }
    }
}
	
}


function getParentName(name) {
    var i = name.lastIndexOf('.');
    if(i > 0) {
        var j = name.lastIndexOf('.', i - 1);

        if(j >= 0) {
            name = name.substr(j + 1, i - j - 1);
        }
    }
    return name.toLowerCase();
}

module.exports = BuildConfig;