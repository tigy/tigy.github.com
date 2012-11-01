/**
 * @fileOverview 用于增删组件, 及组件列表的搜索。
 */



var System = require('./system'),
	Path = require('path'),
	IO = require(System.Configs.nodeModules + 'io');

/**
 * 管理 DPL 的工具。
 */
var DplManager = {

    /**
     * 新建一个组件文件。
     * @param {String} module 组件的模块。
     * @param {String} category 组件的分类。
     * @param {String} name 组件的名字。
     * @param {String} [title] 组件的描述名。默认使用 *name* 作为描述 。
     */
    createDpl: function (module, category, name, title) {

        // 忽略空参数。
        if (!module || !category || !name) {
            return;
        }

        // 获取模板文件夹。
        var tplFolder = this.getTemplatePath(module, category);

        // 获取目标文件夹。
        var targetFolder = this.getCategoryPath(module, category);

        var htmlTargetFolder = System.Configs.src === System.Configs.demo ? null : this.getCategoryPath(module, category, true);

        //// 如果不存在分类文件夹，则创建文件夹。
        //if (!IO.exists(targetFolder)) {

        //    // 从模板复制文件夹。
        //    IO.copyDirectory(tplFolder, targetFolder);

        //    IO.deleteFile(targetFolder + 'index.html');
        //}

        // 获取文件路径。
        var targetFileName = this.getFileName(name);

        // 获取文件列表。
        var tplFiles = IO.getFiles(tplFolder);

        title = title || name;

        for (var i = 0; i < tplFiles.length; i++) {

            var path = tplFiles[i];

            // 仅处理 tpl 文件名。
            if (/(^|\/)tpl\.\w+$/.test(path)) {
                var fromPath = tplFolder + path;

                var toPath = (htmlTargetFolder && /\.html$/.test(path) ? htmlTargetFolder : targetFolder) + path.replace('tpl', targetFileName);

                // 如果目标文件不存在。
                if (!IO.exists(toPath)) {

                    // 读取 HTML 模板内容。
                    var text = IO.readFile(fromPath);

                    // 替换模板。
                    text = text.replace(/FILENAME/g, targetFileName).replace(/TITLE/g, title).replace(/MODULE/g, module).replace(/CATEGORY/g, category).replace(/NAME/g, name);

                    // 写入文件。
                    IO.writeFile(toPath, text, System.Configs.encoding);

                }

            }

        }

        this.updateDplList('demo');

    },

    /**
     * 删除一个组件文件。
     * @param {String} module 组件的模块。
     * @param {String} category 组件的分类。
     * @param {String} name 组件的名字。
     */
    deleteDpl: function (module, category, name) {

        // 忽略空参数。
        if (!module || !category || !name) {
            return;
        }

        // 获取目标文件夹。
        var targetFolder = this.getCategoryPath(module, category);

        // 获取文件路径。
        var targetFileName = this.getFileName(name);

        // 获取文件列表。
        var tplFiles = IO.getFiles(targetFolder);

        for (var i = 0; i < tplFiles.length; i++) {

            var path = tplFiles[i];

            if (("/" + path).indexOf("/" + targetFileName + ".") >= 0) {
                IO.deleteFile(targetFolder + path);
            }
        }

        this.updateDplList('demo');

    },

    /**
     * 更新一个组件的属性。
     * @param {String} module 组件的模块。
     * @param {String} category 组件的分类。
     * @param {String} name 组件的名字。
     * @param {String} [title] 组件的描述名。如果不需要更改，则置为 null 。
     * @param {Object} [dplInfo] 组件的属性。如果不需要更改，则置为 null 。
     */
    updateDpl: function (module, category, name, title, dplInfo) {

        // 忽略空参数。
        if (!module || !category || !name) {
            return;
        }

        // 处理的文件路径。
        var targetPath = this.getHtmlPath(module, category, name);

        if (IO.exists(targetPath)) {

            // 整个 HTML 的源码。
            var text = IO.readFile(targetPath, System.Configs.encoding);

            // 找到 <head>。
            var head = (/<head>([\s\S]*?)<\/head>/.exec(text) || [0, text])[1], oldHead = head;

            // 描述存入 <title> 标签。
            if (title) {

                if (dplInfo && ('title' in dplInfo)) {
                    dplInfo.title = title;
                } else {
                    var titleMatch = /(<title[^\>]*?>)(.*?)(<\/title>)/.exec(head);
                    if (!titleMatch) {
                        head = '<title>' + title + '</title>' + head;
                    } else {
                        head = head.replace(titleMatch[0], titleMatch[1] + title + titleMatch[3]);
                    }
                }
            }

            // dplInfo 存入 meta 标签。
            if (dplInfo) {
                var metaMatch = new RegExp('(<meta\\s+name\\s*=\\s*([\'\"])' + System.Configs.metaDplInfo + '\\2\\s+content\\s*=\\s*([\'\"]))(.*?)(\\3\\s*\\/?>\\s*)').exec(head);

                if (!metaMatch) {

                    if (!dplInfo.support) {
                        delete dplInfo.support;
                    }

                    if (dplInfo.status == "ok") {
                        delete dplInfo.status;
                    }

                    dplInfo = System.stringifyDplInfo(dplInfo);

                    if (dplInfo) {

                        var titleMatch = /(\s*)(<title[^\>]*?>.*?<\/title>)/m.exec(head);

                        if (!titleMatch) {
                            head = '<meta name="' + System.Configs.metaDplInfo + '" content="' + dplInfo + '\">' + head;
                        } else {
                            head = head.replace(titleMatch[0], titleMatch[1] + '<meta name="' + System.Configs.metaDplInfo + '" content="' + dplInfo + '\">' + titleMatch[0]);
                        }

                    }

                } else {

                    var oldDplInfo = System.parseDplInfo(metaMatch[4]);
                    System.extend(oldDplInfo, dplInfo);

                    if (!oldDplInfo.support) {
                        delete oldDplInfo.support;
                    }

                    if (oldDplInfo.status == "ok") {
                        delete oldDplInfo.status;
                    }

                    dplInfo = System.stringifyDplInfo(oldDplInfo);
                    if (dplInfo) {
                        head = head.replace(metaMatch[0], metaMatch[1] + dplInfo + metaMatch[5]);
                    } else {
                        head = head.replace(metaMatch[0], "");
                    }



                }

            }

            text = text.replace(oldHead, head);

            IO.writeFile(targetPath, text, System.Configs.encoding);

            this.updateDplList('demo');
        }

    },
    
    /**
     * 搜索返回 DPL 列表。
     * @param {String} type 搜索的类型。'demo': 搜索用于展示的组件页面。 'src': 搜索用于合成的组件源文件。
     * @return {Object} 返回 JSON 格式如： {'path0': attributes1, 'path1': attributes2}
     */
    getDplList: function (type) {

        // 按照源码搜索全部组件。
        if (type === 'src') {

            var root = System.Configs.physicalPath + System.Configs.src + Path.sep;
            var files = IO.getFiles(root);
            var r = {};

            for (var i = 0; i < files.length; i++) {

                var file = files[i];

                if (/\.(js|css)$/.test(file)) {

                    // 改成组件路径格式。
                    var path = System.toDplPath(file);

                    r[path] = r[path] || {};

                    r[path][/.js$/.test(file) ? 'js' : 'css'] = file;

                }
            }

        } else {

            var root = System.Configs.physicalPath + System.Configs.demo + Path.sep;
            var files = IO.getFiles(root);
            var r = {};

            for (var i = 0; i < files.length; i++) {

                var file = files[i];

                if (/\.html$/.test(file)) {

                    // 自动影藏索引文件。
                    if (Path.basename(file) === 'index.html') {
                        continue;
                    }

                    // 获取 DPL 信息。
                    var dplInfo = this.getDplInfo(root + file);

                    // 检测是否隐藏列表。
                    if (!('hide' in dplInfo) || dplInfo.hide !== "false") {
                        r[System.toDplPath(file)] = dplInfo;
                    }
                }
            }

        }
       
        return r;
    },
    
    /**
     * 更新指定的列表缓存文件。
     * @param {String} type 搜索的类型。'demo': 搜索用于展示的组件页面。 'src': 搜索用于合成的组件源文件。
     */
    updateDplList: function(type){
        var dplListFilePath = System.Configs.physicalPath + System.Configs.dplListFilePath;

        var dplList = this.getDplList(type);
        dplList = JSON.stringify(dplList);
        dplList = 'var DplList=' + dplList + ';';

        IO.writeFile(dplListFilePath, dplList, System.Configs.encoding);
    },

    // 配置函数。

    // 获取模板位置。
    getTemplatePath: function (module, category) {
        return System.Configs.physicalPath + System.Configs.templatePath + Path.sep + module + Path.sep;
    },

    // 获取存放指定分类的文件夹。
    getCategoryPath: function (module, category, demo) {
        return System.Configs.physicalPath + System.Configs[demo === true ? 'demo' : 'src'] + Path.sep + module + Path.sep + category + Path.sep;
    },

    // 获取文件名。
    getFileName: function (name) {
        return name.replace(/\./g, "/");
    },

    // 获取HTML位置。
    getHtmlPath: function (module, category, name) {
        return System.Configs.physicalPath + System.Configs.demo + Path.sep + module + Path.sep + category + Path.sep + name.replace(/\./g, Path.sep) + '.html';
    },

    // 解析一个文件内指定的组件信息。
    getDplInfo: function (fullPath) {

        var dplInfo;

        var text = IO.readFile(fullPath, System.Configs.encoding);

        var meta = new RegExp('(<meta\\s+name\\s*=\\s*([\'\"])' + System.Configs.metaDplInfo + '\\2\\s+content\\s*=\\s*([\'\"]))(.*?)(\\3\\s*\\/?>)');

        if (meta = meta.exec(text)) {
            dplInfo = System.parseDplInfo(meta[4]);
        } else {
            dplInfo = {};
        }

        if (!('title' in dplInfo)) {

            if (meta = /(<title[^\>]*?>)(.*?)(<\/title>)/.exec(text)) {
                dplInfo.name = meta[2];
            } else {
                dplInfo.name = '';
            }

        }

        if (!dplInfo.status) {
            dplInfo.status = 'ok';
        }

        return dplInfo;

    }

};



module.exports = DplManager;