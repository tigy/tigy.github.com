var Path = require('path'), 
	IO = require('../lib/io'),
	FS = require('fs'),
	Util = require('util'),
	BuildConfig = require('./buildconfig');

var BuildFile = function(name, options) {

	this.name = name;
	
	this.js = [];
	this.css = [];
	
	this.exclude = {};
	this.contents = {};

	this.jsRefs = {};
	this.cssRefs = {};
	
	this.jsFiles = {};
	this.cssFiles = {};
	
	options = options || {};
	
	for(var item in options){
		
		switch(item){
			case 'using':
				this.js = this.js.concat(options.using);
				this.css = this.css.concat(options.using);
				break;
			case 'js':
				this.js = this.js.concat(options.js);
				break;
			case 'css':
				this.css = this.css.concat(options.css);
				break;
			case 'imports':
				this.css = this.css.concat(options.imports);
				break;
			case 'load':
				this.load(options.load);
				break;
			case 'excludeCss':
				options.excludeCss.forEach(function(value){
					this.exclude[value] = true;
				}, this);
				break;
			case 'excludeJs':
				options.excludeJs.forEach(function(value){
					this.exclude[value] = false;
				}, this);
				break;
			default:
				this[item] = options[item];	
				break;
		}
		
	}
	
	if(this.top){
		this.js = this.top.concat(this.js);
		this.css = this.top.concat(this.css);
	}
	
	if(this.bottom){
		this.js = this.js.concat(this.bottom);
		this.css = this.css.concat(this.bottom);
	}
	
	this.js = this.js.reverse();
	this.css = this.css.reverse();
	
	this.oninit();
	this.compile();
};

BuildFile.prototype = {
	
	targetImages: 'images',

	log: function(msg){
		console.log(msg);
	},
	
	error: function(msg){
		console.error(msg);
	},
	
	load: function(name) {
		var content = IO.readFile(name);

		if(content) {
			content.split(/[\r\n]+/).forEach(function(line) {
				line = line.replace(/;\s*$/, "").trim();
				var space = line.indexOf(' ');
				var key = line.substr(0, space);
				var value = line.substr(space).trim();
	
				switch(key) {
					case 'using':
						this.js.push(value);
						this.css.push(value);
						break;
					case 'imports':
					case 'import':
						this.css.push(value);
						break;
					case '-using':
						this.exclude[value] = false;
						break;
					case '-imports':
					case '-import':
						this.exclude[value] = true;
						break;
					case '//':
						break;
					default:
						if( typeof this[key] === 'string') {
							this[key] = value;
						} else {
							console.log('Cannot recognise key "' + key + '"');
						}
						break;
	
				}
	
			}, this);	
		}
		trace("载入 .build 文件", this );
	},
	
	save: function(name) {
		name = name || this.name;
		var content = [];

		for(var key in this) {
			if( typeof this[key] === 'string') {
				content.push(key + ' ' + this[key]);
			}
		}

		this.js.forEach(function(value) {
			content.push('using ' + value);
		});

		this.css.forEach(function(value) {
			content.push('import ' + value);
		});

		IO.writeFile(name, content.join('\r\n'));
	},
	
	compile: function(){
		this.data = this.createAst(this);
		
		trace("处理依赖关系", this.data );
	},
	
	createAst: function(tempObj){
	       var map = {};
        var stack = [];
        var result = [];
        var resultCss = [];
       var resultJs = [];
        map['.'] = {
            isStyle: false,
            name: '.',
            parent: [],
            children:[tempObj.js, tempObj.css]
        }
        stack.push(map['.']);
        while(stack.length) {
            var tempArray = stack[stack.length - 1].children;
            var bool = tempArray.length - 1;
            if (bool == -1) {
                result.push(stack.pop());
                if (result[result.length - 1].name === '.') result.pop();
                continue;
            }
            if (!tempArray[bool].length) {
                tempArray.pop();
                continue;
            }
            tempArray = tempArray[bool];
            bool = bool == 1;
            var cname = tempArray.pop();
            var cbname = cname + '.' + bool;
            var has = map[cbname];
            if (!has) {
                tempObj = this.getRefs(cname, bool);
                has = map[cbname] = {
                    isStyle: bool,
                    name: cname,
                    parent: [stack[stack.length - 1].name === '.' ? null : stack[stack.length - 1]],
                    children:[tempObj.js, tempObj.css]
                };
                stack.push(has);
            } else {
                has.parent.push(stack[stack.length - 1].name === '.' ? null : stack[stack.length - 1]);
            }
        }
        for (i = 0; i < result.length; i++) {
         if (result[i].isStyle)
              resultCss.push(result[i]);
             else
                resultJs.push(result[i]);
        }
        return {js:resultJs, css:resultCss};
    },
	
	// BUILD
	
	build: function() {
		
		this.log("**** build ****");
		var cc = process.cwd();
		this.log("source build:    " + this.name);
		this.log("target css:      " + (this.targetCss ? Path.join(cc, this.targetCss) : '(N/A)'));
		this.log("target js:       " + (this.targetJs ? Path.join(cc, this.targetJs) : '(N/A)'));
		this.log("target images:   " + Path.join(cc, Path.dirname(this.targetCss), this.targetImages));
		
		var files = this.getFinalFiles();
		
		trace("获取目标文件列表", files);
		this.log("\r\n");
		
		if(this.targetCss) {
			this.createCssFiles(files.css);
			this.log("\r\n");
		}
		
		if(this.targetJs) {
			this.createJsFiles(files.js);
			this.log("\r\n");
		}
		
		this.log("**** done *****");
	},
	
	getFinalFiles: function(){
		
		if(this.resolveUsing === false){
			return     this;
		}
		
		var finalJsFiles = [];
		var finalCssFiles = [];
		var excudeJsFiles = [];
		var excudeCssFiles = [];
		
		var usedKeys = this.getUsedKeys();
		
		var data = this.data;
		
		data.css.forEach(function(value){
			
			if(value.name in usedKeys.css){
				excudeCssFiles[value.name] = usedKeys.css[value.name];
			} else {
				finalCssFiles.push(value);
				value.path = this.getPath(value.name, true);
			}
			
			
		}, this);
		
		data.js.forEach(function(value){
			if(value.name in usedKeys.js){
				excudeJsFiles[value.name] = usedKeys.js[value.name];
			} else {
				finalJsFiles.push(value);
				value.path = this.getPath(value.name, false);
			}
			
		}, this);
		
		
		return {
			
			js: finalJsFiles,
			
			css: finalCssFiles,
			
			excludeJs: excudeJsFiles,
			
			excludeCss: excudeCssFiles
			
			
		};
		
	},
	
	createJsFiles: function(files){
		
		var writer = IO.openWrite(this.targetJs, {
			flags: 'w+',
			encoding: this.encoding
		});
		
		this.log("***** js ******");
		
		if(this.header)
			this.writeGlobalHeader(writer);
		files.forEach(function(file){
			var name = file.name;
			
			this.log(">>> " + name);
			if(this.header)
				this.writeHeader(writer, name);
			var content = IO.readFile(file.path);
			content = this.resolveJsFile(content, file.path, name);
			this.writeContent(writer, content);
		}, this);
		
		trace("写入目标 js 文件", this.targetJs);
		
		writer.end()
	},
	
	createCssFiles: function(files){
		
		var writer = IO.openWrite(this.targetCss, {
			flags: 'w+',
			encoding: this.encoding
		});
		
		this.log("***** css *****");
		
		if(this.header)
			this.writeGlobalHeader(writer);
		
		files.forEach(function(file){
			var name = file.name;
			
			if(this.header)
				this.writeHeader(writer, name);
			this.log(">>> " + name);
			var content = this.read(file.path);
			content = this.resolveCssFile(content, file.path, name);
			this.writeContent(writer, content);
		}, this);
		
		trace("写入目标 css 文件", this.targetCss);
		
		writer.end()
	},
	
	// INTERNAL
	
	read: function(path) {
		return IO.exists(path) ? FS.readFileSync(path, this.sourceEncoding) : '';
	},
	
	write: function(path, content) {
		return FS.wrireFileSync(path, content, this.encoding);
	},
	
	exists: IO.exists,
	
	checkNamespace: function(namespace, isStyle){
		var path = this.getPath(namespace, isStyle);
		
		return this.exists(path);
	},
	
	getPath: function(namespace, isStyle){

		var cache = isStyle ? this.cssFiles: this.jsFiles;

		if(!cache[namespace]) {
			cache[namespace] = this.resolveNamespace(namespace, isStyle);
		}

		return cache[namespace];
		
	},

	/**
	 * 解析一个文件的全部依赖关系。
	 */
	getRefs: function(namespace, isStyle) {

		var cache = isStyle ? this.cssRefs: this.jsRefs;

		if(!cache[namespace]) {
			cache[namespace] = this.resolveRefs(namespace, isStyle);
			
			// 如果是样式文件，还需要从js文件入手搜索引用项。
			var r = cache[namespace].css;
			
			if(isStyle) {
				
				[].push.apply(r, this.getRefs(namespace, false).css);	
				
				var i = r.indexOf(namespace);
				
				
				if(i >= 0)  {
					r.splice(i, 1);
				}
				
			}
			
			cache[namespace].css = r.filter(function(value){
				return this.checkNamespace(value, true);
			}, this);
		}

		return cache[namespace];
	},
	
	getContent: function(namespace, isStyle){
		var key = namespace + '.' + isStyle;
		if(!this.contents[key])
			this.contents[key] = this.read(this.getPath(namespace, isStyle));
		
		
		return this.contents[key];
			
	},
	
	writeRequires: function(usedCssKeys, usedJsKeys, processed){
		if(this.require && !(this.name in processed)){
			processed[this.name] = this;
			this.require.split(';').forEach(function(value){
				value = value.trim();
				var t = DplBuilder.getBuildFile(value, this.name);
				
				for(var value in t.data.css){
					usedCssKeys[t.data.css[value].name] = t.name;
				}
				
				for(var value in t.data.js){
					usedJsKeys[t.data.js[value].name] = t.name;
				}
				
				t.writeRequires(usedCssKeys, usedJsKeys, processed);
			}, this);
		}
	},
	
	getUsedKeys: function(){
		
		
		var usedCssKeys = {};
		var usedJsKeys = {};
		
		this.writeRequires(usedCssKeys, usedJsKeys, {});
		
		for(var key in this.exclude){
			usedCssKeys[key] = '';
			if(this.exclude[key] === false){
				usedJsKeys[key] = '';
			}
		}
		
		return {
			css: usedCssKeys,
			
			js: usedJsKeys
			
		};
		
		
		
	}
	
};
	
var DplBuilder = {
	
	BuildFile: BuildFile,
	
	initConfigs: function(configs) {
		var p = BuildFile.prototype;
			
		for(var item in configs) {
			p[item] = configs[item];
		}
	},
	
	getBuildFile: function(name, basePath){
		
		if(basePath){
			name = Path.resolve(basePath, name);
		}
		
		var bName = name.indexOf('.build') === -1 ? name + '.build' : name;
		
		var buildFile = new BuildFile(name, {
			targetJs: bName.replace('.build', '.js'),
			targetCss: bName.replace('.build', '.css'),
			load: name
		});
		
		
		return buildFile;
	},
	
	/**
	 * 使用指定的配置来编译指定 .build 文件。
	 */
	build: function(path, configs) {
		return DplBuilder.getBuildFile(path, configs).build();
	}
	
};

DplBuilder.initConfigs(BuildConfig);

module.exports = DplBuilder;

function trace(message){
	  return;
	[].unshift.call(arguments, '[DEBUG]      ');
	console.error.apply(console, arguments);
}
