/**
 * @fileOverview 用于合成组件。
 */



var System = require('./system'),
    DplFile = require('./dplfile'),
	Path = require('path'),
	IO = require(System.Configs.nodeModules + 'io');

function writeHeader(response, title){
	
	var rootPath = System.Configs.rootUrl;
	
	response.write('\
	<!DOCTYPE html>\
	<html>\
	<head>\
	    <meta charset="UTF-8">\
	    <title>' + title + '</title>\
	    <link href="' + rootPath + 'assets/dpl/assets/base.css" rel="stylesheet" type="text/css">\
	    <link href="' + rootPath + 'assets/dpl/assets/dplbuilder.css" rel="stylesheet" type="text/css">\
	    <script src="' + rootPath + 'assets/dpl/assets/base.js" type="text/javascript"></script>\
	    <script src="' + rootPath + 'assets/demo/demo.js" type="text/javascript"></script>\
		<script src="' + rootPath + 'assets/dpl/assets/jsonp.js" type="text/javascript"></script>\
		<script src="' + rootPath + 'assets/dpl/assets/dplbuilder.js" type="text/javascript"></script>\
	</head>\
	<body>\
	\
	    <article class="demo">');
}

function writeFooter(response){
	response.write('\
	    </article>\
	\
	</body>\
	</html>');
}

function writeDplFileBuilder(response, dplFile){
	var p = dplFile.properties;
	response.write('<table>\
            <tr>\
                <th class="dpllist border-right">\
                    组件列表</th>\
                <th class="dplproperty">基本属性</th>\
            </tr>\
            <tr>\
                <td class="border-right content dpls">\
                	\
                </td>\
                <td class="content props">\
                    <div class="x-formfield">\
                        <label class="x-formfield-label">合成方案路径:                 </label>\
                        <div class="x-formfield-container">\
                            <input type="text" placeholder="相对项目位置的 .dpl 文件路径" name="path" class="x-textbox large" value="">\
                        </div>\
                    </div>\
                    <div class="x-formfield">\
                        <label class="x-formfield-label">基础路径:                 </label>\
                        <div class="x-formfield-container">\
                            <input type="text" placeholder="相对项目位置的 .dpl 文件路径" name="base" class="x-textbox large" value="">\
                        </div>\
                    </div>\
                    <hr>\
                    <div class="x-formfield">\
                        <label class="x-formfield-label">合成方案标题:                 </label>\
                        <div class="x-formfield-container">\
                            <input type="text" placeholder="(可选)用于描述当前合成方案的主要用途" name="title" class="x-textbox large" value="">\
                        </div>\
                    </div>\
                    <div class="x-formfield">\
                        <label class="x-formfield-label">目标js路径:                 </label>\
                        <div class="x-formfield-container">\
                            <input type="text" placeholder="相对于基础路径的 .js 文件路径" name="js" class="x-textbox large" value="">\
                        </div>\
                    </div>\
                    <div class="x-formfield">\
                        <label class="x-formfield-label">目标css路径:                 </label>\
                        <div class="x-formfield-container">\
                            <input type="text" placeholder="相对于基础路径的 .css 文件路径" name="css" class="x-textbox large" value="">\
                        </div>\
                    </div>\
                    <div class="x-formfield">\
                        <label class="x-formfield-label">目标图片路径:                 </label>\
                        <div class="x-formfield-container">\
                            <input type="text" placeholder="相对于基础路径的图片文件夹路径" class="x-textbox large" name="images" value="">\
                        </div>\
                    </div>\
                    <hr>\
                    <div class="x-formfield">\
                        <label class="x-formfield-label">依赖的合成方案:                 </label>\
                        <div class="x-formfield-container">\
                            <input type="text" placeholder="依赖项中包含的组件将被排除。多个项之间用;隔开" value="" name="requires" class="x-textbox large">\
                        </div>\
                    </div>\
                    <div class="x-formfield">\
                        <label class="x-formfield-label">动态解析:                 </label>\
                        <div class="x-formfield-container">\
                            <label class="short">\
                                <input type="checkbox" checked="checked" name="parseMacro" class="x-checkbox">解析宏</label>\
                            预定义宏：\
                                <input type="text" placeholder="多个项之间用;隔开" value="" name="defines" class="x-textbox">\
                            <!--<br />\
\
                            <label class="short">\
                                <input type="checkbox" checked="checked" name="macro" class="x-checkbox">解析 less</label>\
                            优先使用： \
                            <label>\
                                <input type="radio" class="x-radiobutton" /> .less 文件\
                            </label>\
                            <label>\
                                <input type="radio" class="x-radiobutton" />\
                                .css 文件\
                            </label>\
                            <br />\
\
                            <label class="short">\
                                <input type="checkbox" checked="checked" name="macro" class="x-checkbox">解析 sass</label>\
                            优先使用：\
                               <label>\
                                   <input type="radio" class="x-radiobutton" />\
                                   .sass 文件\
                               </label>\
                            <label>\
                                <input type="radio" class="x-radiobutton" />\
                                .css 文件\
                                \
                            </label>\
                            <br />\
\
                            <label class="short">\
                                <input type="checkbox" checked="checked" name="macro" class="x-checkbox">解析 coffee</label>\
                            优先使用：\
                                <label>\
                                    <input type="radio" class="x-radiobutton" />\
                                    .coffee 文件\
                                </label>\
                                <label>\
                                    <input type="radio" class="x-radiobutton" />\
                            .js 文件\
                                </label>\
                            <br />-->\
\
                        </div>\
                    </div>\
                    <div class="x-formfield">\
                        <label class="x-formfield-label">代码优化:                 </label>\
                        <div class="x-formfield-container">\
                            <label class="short">\
                                <input type="checkbox" checked="checked" name="removeTrace" class="x-checkbox">删除 trace</label>\
                            <label class="short">\
                                <input type="checkbox" name="removeAssert" class="x-checkbox">删除 assert</label>\
                            <label class="short">\
                                <input type="checkbox" name="removeConsole" class="x-checkbox">删除 console</label>\
                            <!--<br />\
                            js 文件：&nbsp;&nbsp;\
                             <label>\
                                 <input type="radio" name="removeTrace" class="x-radiobutton">不处理</label>\
                            <label>\
                                <input type="radio" name="removeTrace" class="x-radiobutton">仅删除注释</label>\
                            <label>\
                                <input type="radio" name="removeTrace" class="x-radiobutton">压缩</label>\
                            <br />\
                            css 文件： \
                             <label>\
                                 <input type="radio" name="removeTrace" class="x-radiobutton">不处理</label>\
                            <label>\
                                <input type="radio" name="removeTrace" class="x-radiobutton">仅删除注释</label>\
                            <label>\
                                <input type="radio" name="removeTrace" class="x-radiobutton">压缩</label>-->\
                        </div>\
                    </div>\
                    <div class="x-formfield">\
                        <label class="x-formfield-label">其他选项:                 </label>\
                        <div class="x-formfield-container">\
                            <label class="short">\
                                <input type="checkbox" checked="checked" name="addHeader" class="x-checkbox">添加合成注释</label>\
                            <label class="short">\
                                <input type="checkbox" checked="checked" name="resolveRefs" class="x-checkbox">智能解析依赖</label>\
                            \
                        </div>\
                    </div>\
                </td>\
            </tr>\
        </table>\
\
        <div class="button-label">\
            <input type="button" onclick="DplBuilder.saveAndBuildFile()" class="x-button x-button-info" value="保存并生成">\
            <input type="button" onclick="DplBuilder.saveFile()" class="x-button" value="保存">\
            <input type="button" onclick="DplBuilder.previewFile()" class="x-button" value="预览">\
            <input type="button" onclick="location.href=Demo.Configs.rootUrl + \'assets/dpl/dplfilelist.html\'" class="x-button" value="返回">\
        </div>');
    
    response.write('<script>var DplFile=');
    
    response.write(JSON.stringify({
    	properties: dplFile.properties,
    	dpls: dplFile.dpls,
    	requires: dplFile.requires,
    	path: dplFile.path
   	}));
    
    response.write(';  DplBuilder.loadDplFile();</script>');
    
}

function writeDplBuildLog(response, dplFile){
	
	var DplBuilder = require('./dplbuilder');
	
	response.write('<div class="x-right"><a style="cursor: default" class="x-button x-button-info" href="?action=build&file=' + dplFile.path + '">重新生成</a>  <a style="cursor: default" class="x-button" href="../dplfilelist.html" title="合法方案列表">返回列表</a>  <a style="cursor: default" class="x-button" href="?action=edit&file=' + dplFile.path + '">重新编辑</a></div>')
	
	response.write('<h2 class="demo">合成日志 <small>合成完成前请勿关闭本页面</small></h2>')
	
	
	DplBuilder.info = function(content){
		response.write('<h4 class="demo">' + content + '</h4>');
	};
	
	DplBuilder.infoFile = function(content, path){
		this.log(content + '<a href="/explorer:' + path.replace(/\\/g, "/") + '">' + path + '</a>'+ '\r\n');
	};
	
	DplBuilder.log = function(content){
		response.write('<pre>' + content + '</pre>');
		//for(var i = 0; i < 1000; i++){console.log(i)}
	};
	
	DplBuilder.error = function(content){
		response.write('<pre style="color:red">' + content + '</pre>');
	};

	DplBuilder.end = function () {
	    writeFooter(response);
	    response.end();
	};
	
	DplBuilder.build(dplFile);
	
	
}

function writePreview(response, dplFile) {

    var DplBuilder = require('./dplbuilder');

    response.write('合法方案: <strong>' + dplFile.path + '</strong>');
    
    var list = DplBuilder.getFinalList(dplFile);

    response.write('<h3 class="demo">最终的 js 列表</h3><table class="x-table"><tr><th>组件</th><th>来自</th></tr>');
    var d = list.js;
    for (var i = 0; i < d.length; i++) {
        response.write('<tr><td>');
        response.write('<a href="' + System.Configs.rootUrl + System.Configs.src + '/' + d[i].path + '" target="_blank">' + d[i].name + '</a>');
        response.write('</td><td>');
        var flag = false;
        for (var j = 0; j < d[i].parent.length; j++) {
            if (d[i].parent[j]) {
                if (flag) {
                    response.write('<br>');
                } else {
                    flag = true;
                }
                response.write('<a href="' + System.Configs.rootUrl + System.Configs.src + '/' + d[i].parent[j].path + '" target="_blank">' + (d[i].parent[j].isStyle ? '[css]' : '[js]') + d[i].parent[j].name + '</a>');
            }
        }
        response.write('</td></tr>');
    }

    response.write('</table>');

    response.write('<h3 class="demo">最终的 css 列表</h3><table class="x-table"><tr><th>组件</th><th>来自</th></tr>');
    var d = list.js;
    for (var i = 0; i < d.length; i++) {
        response.write('<tr><td>');
        response.write('<a href="' + System.Configs.rootUrl + System.Configs.src + '/' + d[i].path + '" target="_blank">' + d[i].name + '</a>');
        response.write('</td><td>');
        var flag = false;
        for (var j = 0; j < d[i].parent.length; j++) {
            if (d[i].parent[j]) {
                if (flag) {
                    response.write('<br>');
                } else {
                    flag = true;
                }
                response.write('<a href="' + System.Configs.rootUrl + System.Configs.src + '/' + d[i].parent[j].path + '" target="_blank">' + (d[i].parent[j].isStyle ? '[css]' : '[js]') + d[i].parent[j].name + '</a>');
            }
        }
        response.write('</td></tr>');
    }

    response.write('</table>');
	
}

exports.writeHeader = writeHeader;
exports.writeFooter = writeFooter;
exports.writeDplFileBuilder = writeDplFileBuilder;
exports.writeDplBuildLog = writeDplBuildLog;
exports.writePreview = writePreview;






