/**
 * @fileOverview 测试系统核心引擎
 */

/// #region 前后台公用的部分

var Demo = Demo || {};

/**
 * 复制对象的所有属性到其它对象。
 * @param {Object} dest 复制的目标对象。
 * @param {Object} src 复制的源对象。
 */
Demo.extend = function (dest, src) {
    for (var i in src) {
        dest[i] = src[i];
    }
};

Demo.extend(Demo, {

    /**
     * 配置模块。
     */
    Configs: {

        /**
         * 指示当前系统在后台运行时的域名。
         */
        host: "localhost",

        /**
         * 指示当前系统在后台运行时的端口。
         */
        port: 50001,

        /**
         * 存放源文件的文件夹。
         */
        src: "src",

        /**
         * 存放源文件的文件夹。
         */
        demo: "src",

        /**
         * 存放示例文件的文件夹。
         */
        examples: 'examples',

        /**
         * demo.js 文件路径。
         */
        demoFilePath: 'assets/demo/demo.js',

        /**
         * template 文件路径。
         */
        templatePath: 'assets/data/templates',

        /**
         * 客户端使用的 api 文件地址。
         */
        apiPath: 'assets/dpl/server/',

        /**
         * 搜索 .dpl 的位置。
         */
        dplbuildFilesPath: 'assets/data/buildfiles/',

        /**
         * 存放数据字段的 meta 节点。
         */
        metaDplInfo: 'dpl-info',

        /**
         * 存放静态组件列表的缓存文件。
         */
        dplListFilePath: 'assets/data/dpllist.js',

        /**
         * 整个项目标配使用的编码。
         */
        encoding: 'utf-8',

        /**
         * dpl 访问历史最大值。
         */
        maxHistory: 10,

        /**
         * 工具的下拉菜单 HTML 模板。
         */
        tool: '<a href="~/assets/dpl/dplfilelist.html" target="_blank">组件合成工具</a>\
                <a href="~/assets/dpl/codehelper.html" target="_blank">代码工具</a>\
                <a href="~/assets/dpl/specialcharacters.html" target="_blank">特殊字符</a>\
                <!--<a href="~/resources/index.html#tool" target="_blank">更多工具</a>-->\
                <a href="{serverRootUrl}explorer:{pathname}" style="border-top: 1px solid #EBEBEB;">打开源文件</a>\
                <a href="javascript://展开或折叠全部源码" onclick="Demo.System.toggleSources()">切换源码折叠</a>',

        /**
         * 文档的下拉菜单 HTML 模板。
         */
        doc: '<a href="~/resources/cookbooks/jplusui-full-api/index.html" target="_blank">jPlusUI API 文档</a>\
                <a href="~/resources/cookbooks/jplusui-core-api/index.html" target="_blank">jPlusUI Core 文档</a>\
                <a href="~/resources/cookbooks/jquery2jplus.html" target="_blank">jQuery 转 jPlusUI</a>\
                <!--<a href="~/resources/cookbooks/dplsystem.html" target="_blank" style="border-top: 1px solid #EBEBEB;">组件开发教程</a>-->\
                <a href="~/resources/cookbooks/dev/dplsystem.html" target="_blank">测试系统用法</a>\
                <a href="~/resources/cookbooks/classdiagram" target="_blank">类图</a>\
                <!--<a href="~/resources/index.html#doc" target="_blank" style="border-top: 1px solid #EBEBEB;">更多文档</a>-->',

        /**
         * 底部 HTML 模板。
         */
        footer: '<footer class="demo"><hr class="demo"><nav class="demo-toolbar"><a href="http://www.jplusui.com/">jPlusUI.com</a> | <a href="https://www.github.com/jplusui/jplusui">Github</a> | <a href="#">返回顶部</a></nav><span>Copyright &copy; 2011-2012 J+ Team</span></footer>',

        /**
         * 合法的状态值。
         */
        status: {
            'ok': '已完成',
            'beta': '测试版',
            'complete': '完美版',
            'plan': '计划中',
            'develop': '开发中',
            'obsolete': '已放弃'
        },

        /**
         * 合法的浏览器。
         */
        support: 'IE6|IE7|IE7|IE8|IE10|FireFox|Chrome|Opera|Safari'.split('|')

    },

    /**
     * System.Dom.Base => System, Dom, Base
     */
    splitPath: function (path) {
        var r = {}, left = path.indexOf('.'), right = path.indexOf('.', left + 1);
        if (left === -1) {
            r.module = path;
            r.category = '';
            r.name = '';
        } else if (right == -1) {
            r.module = path.substring(0, left);
            r.category = path.substring(left + 1);
            r.name = '';
        } else {
            r.module = path.substring(0, left);
            r.category = path.substring(left + 1, right);
            r.name = path.substring(right + 1);
        }
        return r;
    },

    /**
     * 获取当前页面指定的控件的信息。
     */
    parseDplInfo: function (value) {

        var r = {}, i, t, s;

        value = value.split(';');

        for (i = 0; i < value.length; i++) {
            t = value[i];
            s = t.indexOf('=');
            r[t.substr(0, s)] = t.substr(s + 1);
        }

        return r;

        //return {
        //    status: 'ok',
        //    statusText: '已完成',
        //    support: 'IE7|33',
        //    name: '核心',
        //    path: 'System.Core.Base',
        //    hide: false
        //};

    },

    /**
     * 获取当前页面指定的控件的信息。
     */
    stringifyDplInfo: function (value) {

        var r = [];

        for (var key in value) {
            r.push(key + '=' + value[key]);
        }

        return r.join(';');

    },

    /**
     * 根据组件路径获取组件的演示页地址。
     */
    getDemoUrl: function (dplPath) {
        return Demo.Configs.rootUrl + Demo.Configs.demo + '/' + dplPath.replace(/\./g, "/") + ".html";
    },

    /**
     * 根据文件名获取组件的路径。
     */
    toDplPath: function (fileName) {

        return fileName.replace('/assets/', '/').replace('/scripts/', '/').replace('/styles/', '/').replace(/\.html([#?].*)?$/, '').replace(/\.\w+$/, '').replace(/\//g, '.');
    },

    /**
     * 将列表转为树结构方便遍历。
     */
    listToTree: function (list) {

        var tree = {}, path, t;

        for (path in list) {
            var split = Demo.splitPath(path);

            t = tree[split.module] || (tree[split.module] = {});
            t = t[split.category] || (t[split.category] = {});

            t[split.name] = path;
        }

        return tree;
    }

});

/// #endregion

// 指示当前系统是否在后台运行。
if (typeof module !== 'object') {

    /// #region 前台专用的部分

    Demo.extend(Demo, {

        indexOf: function (arr, value) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === value) {
                    return i;
                }
            }

            return -1;
        },

        /**代码处理模块*/
        Text: {

            /**
             * 编码 HTML 特殊字符。
             * @param {String} value 要编码的字符串。
             * @return {String} 返回已编码的字符串。
             * @remark 此函数主要将 & < > ' " 分别编码成 &amp; &lt; &gt; &#39; &quot; 。
             */
            encodeHTML: (function (map) {
                function replaceMap(v) {
                    return map[v];
                }

                return function (value) {
                    return value.replace(/[&<>\'\"]/g, replaceMap);
                };
            })({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '\'': '&#39;',
                '\"': '&quot;'
            }),

            encodeJs: (function (map) {
                function replaceMap(v) {
                    return map[v];
                }

                return function (value) {
                    return value.replace(/[\\\'\"\r\n]/g, replaceMap);
                };
            })({
                '\\': '\\\\',
                '\'': '\\\'',
                '\"': '\\\"',
                '\r': '\\\r',
                '\n': '\\\n'
            }),

            /**
             * 反编码 utf-8 字符串。
             * @param {String} s 已使用 UTF-8 编码的字符串。
             * @return {String} 返回原始字符串。
             * @remark UTF-8 编码的字符串如： '\u2342'
             */
            decodeUTF8: function (s) {
                return s.replace(/\\u([0-9a-f]{3})([0-9a-f])/gi, function (a, b, c) {
                    return String.fromCharCode((parseInt(b, 16) * 16 + parseInt(c, 16)))
                })
            },

            /**
             * 格式化 HTML 代码。
             * @param {String} s 要格式化的 HTML 代码。
             * @param {String} indentCharacter=(2个空格) 用于缩进的字符。
             * @param {Integer} indentSize=2 缩进字符的数目。
             * @return {String} 返回格式化后的代码。
             */
            formatHTML: (function () {

                function HtmlFormater() {

                    this.tags = { //An object to hold tags, their position, and their parent-tags, initiated with default values
                        parent: 'parent1',
                        parentcount: 1,
                        parent1: ''
                    };

                };

                HtmlFormater.prototype = {

                    //HtmlFormater position
                    pos: 0,
                    token: '',
                    currentMode: 'CONTENT',
                    tagType: '',
                    tokenText: '',
                    lastToken: '',
                    lastText: '',
                    tokenType: '',

                    Utils: { //Uilities made available to the various functions
                        whitespace: "\n\r\t ".split(''),
                        singleToken: 'br input link meta !doctype basefont base area hr wbr param img isindex ?xml embed'.split(' '),

                        // inlines
                        simple: 'a li button p span strong option em i b u title textarea'.split(' '),
                        //all the single tags for HTML
                        extra_liners: [],
                        //for tags that need a line of whitespace before them
                        in_array: function (what, arr) {
                            for (var i = 0; i < arr.length; i++) {
                                if (what === arr[i]) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    },

                    getContent: function () { //function to capture regular content between tags
                        var chart = '';
                        var content = [];
                        var space = false;
                        //if a space is needed
                        while (this.input.charAt(this.pos) !== '<') {
                            if (this.pos >= this.input.length) {
                                return content.length ? content.join('') : ['', 'TK_EOF'];
                            }
                            chart = this.input.charAt(this.pos);
                            this.pos++;
                            this.lineCharCount++;

                            if (this.Utils.in_array(chart, this.Utils.whitespace)) {
                                if (content.length) {
                                    space = true;
                                }
                                this.lineCharCount--;
                                continue;
                                //don't want to insert unnecessary space
                            } else if (space) {
                                if (this.lineCharCount >= this.maxChar) { //insert a line when the maxChar is reached
                                    content.push('\n');
                                    for (var i = 0; i < this.indent_level; i++) {
                                        content.push(this.indentString);
                                    }
                                    this.lineCharCount = 0;
                                } else {
                                    content.push(' ');
                                    this.lineCharCount++;
                                }
                                space = false;
                            }
                            content.push(chart);
                            //letter at-a-time (or string) inserted to an array
                        }
                        return content.length ? content.join('') : '';
                    },

                    getScript: function () { //get the full content of a script to pass to js_beautify
                        var chart = '';
                        var content = [];
                        var reg_match = new RegExp('\<\/script' + '\>', 'igm');
                        reg_match.lastIndex = this.pos;
                        var reg_array = reg_match.exec(this.input);
                        var endScript = reg_array ? reg_array.index : this.input.length; //absolute end of script
                        while (this.pos < endScript) { //get everything in between the script tags
                            if (this.pos >= this.input.length) {
                                return content.length ? content.join('') : ['', 'TK_EOF'];
                            }

                            chart = this.input.charAt(this.pos);
                            this.pos++;

                            content.push(chart);
                        }
                        return content.length ? content.join('') : ''; //we might not have any content at all
                    },

                    recordTag: function (tag) { //function to record a tag and its parent in this.tags Object
                        if (this.tags[tag + 'count']) { //check for the existence of this tag type
                            this.tags[tag + 'count']++;
                            this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
                        } else { //otherwise initialize this tag type
                            this.tags[tag + 'count'] = 1;
                            this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
                        }
                        this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
                        this.tags.parent = tag + this.tags[tag + 'count']; //and make this the forEach parent (i.e. in the case of a div 'div1')
                    },

                    retrieveTag: function (tag) { //function to retrieve the opening tag to the corresponding closer
                        if (this.tags[tag + 'count']) { //if the openener is not in the Object we ignore it
                            var temp_parent = this.tags.parent; //check to see if it's a closable tag.
                            while (temp_parent) { //till we reach '' (the initial value);
                                if (tag + this.tags[tag + 'count'] === temp_parent) { //if this is it use it
                                    break;
                                }
                                temp_parent = this.tags[temp_parent + 'parent']; //otherwise keep on climbing up the DOM Tree
                            }
                            if (temp_parent) { //if we caught something
                                this.indent_level = this.tags[tag + this.tags[tag + 'count']]; //set the indent_level accordingly
                                this.tags.parent = this.tags[temp_parent + 'parent']; //and set the forEach parent
                            }
                            delete this.tags[tag + this.tags[tag + 'count'] + 'parent']; //delete the closed tags parent reference...
                            delete this.tags[tag + this.tags[tag + 'count']]; //...and the tag itself
                            if (this.tags[tag + 'count'] == 1) {
                                delete this.tags[tag + 'count'];
                            } else {
                                this.tags[tag + 'count']--;
                            }
                        }
                    },
                    getTag: function () { //function to get a full tag and parse its type
                        var chart = '';
                        var content = [];
                        var space = false;

                        do {
                            if (this.pos >= this.input.length) {
                                return content.length ? content.join('') : ['', 'TK_EOF'];
                            }
                            chart = this.input.charAt(this.pos);
                            this.pos++;
                            this.lineCharCount++;

                            if (this.Utils.in_array(chart, this.Utils.whitespace)) { //don't want to insert unnecessary space
                                space = true;
                                this.lineCharCount--;
                                continue;
                            }

                            if (chart === "'" || chart === '"') {
                                if (!content[1] || content[1] !== '!') { //if we're in a comment strings don't get treated specially
                                    chart += this.getUnformatted(chart);
                                    space = true;
                                }
                            }

                            if (chart === '=') { //no space before =
                                space = false;
                            }

                            if (content.length && content[content.length - 1] !== '=' && chart !== '>' && space) { //no space after = or before >
                                if (this.lineCharCount >= this.maxChar) {
                                    this.printNewline(false, content);
                                    this.lineCharCount = 0;
                                } else {
                                    content.push(' ');
                                    this.lineCharCount++;
                                }
                                space = false;
                            }
                            content.push(chart);
                            //inserts character at-a-time (or string)
                        } while (chart !== '>');

                        var tagComplete = content.join('');
                        var tagIndex;
                        if (tagComplete.indexOf(' ') != -1) { //if there's whitespace, thats where the tag name ends
                            tagIndex = tagComplete.indexOf(' ');
                        } else { //otherwise go with the tag ending
                            tagIndex = tagComplete.indexOf('>');
                        }
                        var tagCheck = tagComplete.substring(1, tagIndex).toLowerCase();
                        if (tagComplete.charAt(tagComplete.length - 2) === '/' || this.Utils.in_array(tagCheck, this.Utils.singleToken)) { //if this tag name is a single tag type (either in the list or has a closing /)
                            this.tagType = 'SINGLE';
                        } else if (tagCheck === 'script') { //for later script handling
                            this.recordTag(tagCheck);
                            this.tagType = 'SCRIPT';
                        } else if (tagCheck === 'style') { //for future style handling (for now it justs uses getContent)
                            this.recordTag(tagCheck);
                            this.tagType = 'STYLE';
                        } else if (tagCheck.charAt(0) === '!') { //peek for <!-- comment
                            if (tagCheck.indexOf('[if') != -1) { //peek for <!--[if conditional comment
                                if (tagComplete.indexOf('!IE') != -1) { //this type needs a closing --> so...
                                    var comment = this.getUnformatted('-->', tagComplete);
                                    //...delegate to getUnformatted
                                    content.push(comment);
                                }
                                this.tagType = 'START';
                            } else if (tagCheck.indexOf('[endif') != -1) { //peek for <!--[endif end conditional comment
                                this.tagType = 'END';
                                this.unindent();
                            } else if (tagCheck.indexOf('[cdata[') != -1) { //if it's a <[cdata[ comment...
                                var comment = this.getUnformatted(']]>', tagComplete);
                                //...delegate to getUnformatted function
                                content.push(comment);
                                this.tagType = 'SINGLE';
                                //<![CDATA[ comments are treated like single tags
                            } else {
                                var comment = this.getUnformatted('-->', tagComplete);
                                content.push(comment);
                                this.tagType = 'SINGLE';
                            }
                        } else {
                            var tagName;
                            if (tagCheck.charAt(0) === '/') { //this tag is a double tag so check for tag-ending
                                this.retrieveTag(tagName = tagCheck.substring(1));
                                //remove it and all ancestors
                                this.tagType = 'END';
                            } else { //otherwise it's a start-tag
                                this.recordTag(tagName = tagCheck);
                                //push it on the tag stack
                                this.tagType = 'START';
                            }

                            if (this.Utils.in_array(tagName, this.Utils.simple)) {
                                this.tagType = 'INLINE_' + this.tagType;
                            }

                            if (this.Utils.in_array(tagCheck, this.Utils.extra_liners)) { //check if this double needs an extra line
                                this.printNewline(true, this.output);
                            }
                        }
                        return content.join('');
                        //returns fully formatted tag
                    },
                    getUnformatted: function (delimiter, origTag) { //function to return unformatted content in its entirety
                        if (origTag && origTag.indexOf(delimiter) != -1) {
                            return '';
                        }
                        var chart = '';
                        var content = '';
                        var space = true;
                        do {
                            chart = this.input.charAt(this.pos);
                            this.pos++

                            if (this.Utils.in_array(chart, this.Utils.whitespace)) {
                                if (!space) {
                                    this.lineCharCount--;
                                    continue;
                                }
                                if (chart === '\n' || chart === '\r') {
                                    content += '\n';
                                    for (var i = 0; i < this.indent_level; i++) {
                                        content += this.indentString;
                                    }
                                    space = false;
                                    //...and make sure other indentation is erased
                                    this.lineCharCount = 0;
                                    continue;
                                }
                            }
                            content += chart;
                            this.lineCharCount++;
                            space = true;

                        } while (content.indexOf(delimiter) == -1);
                        return content;
                    },
                    getToken: function () { //initial handler for token-retrieval
                        var token;

                        if (this.lastToken === 'TK_TAG_SCRIPT') { //check if we need to format javascript
                            var tempToken = this.getScript();
                            if (typeof tempToken !== 'string') {
                                return tempToken;
                            }
                            token = Demo.Text.formatJS(tempToken, {
                                indent_size: this.indentSize,
                                indent_char: this.indentCharacter,
                                indent_level: this.indent_level
                            });
                            //call the JS Beautifier
                            return [token, 'TK_CONTENT'];
                        }
                        if (this.currentMode === 'CONTENT') {
                            token = this.getContent();
                            if (typeof token !== 'string') {
                                return token;
                            } else {
                                return [token, 'TK_CONTENT'];
                            }
                        }

                        if (this.currentMode === 'TAG') {
                            token = this.getTag();
                            if (typeof token !== 'string') {
                                return token;
                            } else {
                                var tagNameType = 'TK_TAG_' + this.tagType;
                                return [token, tagNameType];
                            }
                        }
                    },

                    printer: function (jsSource, indentCharacter, indentSize, maxChar) { //handles input/output and some other printing functions
                        this.input = jsSource || '';
                        //gets the input for the HtmlFormater
                        this.output = [];
                        this.indentCharacter = indentCharacter || '　';
                        this.indentString = '';
                        this.indentSize = indentSize || 2;
                        this.indent_level = 0;
                        this.maxChar = maxChar || 80;
                        //maximum amount of characters per line
                        this.lineCharCount = 0;
                        //count to see if maxChar was exceeded
                        for (var i = 0; i < this.indentSize; i++) {
                            this.indentString += this.indentCharacter;
                        }

                        return this;
                    },

                    printNewline: function (ignore, arr) {
                        this.lineCharCount = 0;
                        if (!arr || !arr.length) {
                            return;
                        }
                        if (!ignore) { //we might want the extra line
                            while (this.Utils.in_array(arr[arr.length - 1], this.Utils.whitespace)) {
                                arr.pop();
                            }
                        }
                        arr.push('\n');
                        for (var i = 0; i < this.indent_level; i++) {
                            arr.push(this.indentString);
                        }
                    },

                    printToken: function (text) {
                        this.output.push(text);
                    },

                    indent: function () {
                        this.indent_level++;
                    },

                    unindent: function () {
                        if (this.indent_level > 0) {
                            this.indent_level--;
                        }
                    },

                    parse: function (htmlSource, indentCharacter, indentSize) {
                        var me = this;
                        me.printer(htmlSource, indentCharacter, indentSize); //initialize starting values
                        var hasContent = true;
                        var lastIsInline = false;
                        
                        while (true) {
                            var t = me.getToken();
                            me.tokenText = t[0];
                            me.tokenType = t[1];
                            if (me.tokenType === 'TK_EOF') {
                                break;
                            }

                            switch (me.tokenType) {
                                case 'TK_TAG_START':
                                case 'TK_TAG_SCRIPT':
                                case 'TK_TAG_STYLE':
	                                me.printNewline(false, me.output);
                                    me.printToken(me.tokenText);
                                    me.indent();
                                    me.currentMode = 'CONTENT';
                                    lastIsInline = false;
                                    break;
                                case 'TK_TAG_INLINE_START':
                                	if(!lastIsInline)
                                   		me.printNewline(false, me.output);
                                    me.printToken(me.tokenText);
                                    me.currentMode = 'CONTENT';
                                    lastIsInline = true;
                                    break;
                                case 'TK_TAG_END':
                                    if (hasContent) {
                                        me.printNewline(true, me.output);
                                    } else {
                                        hasContent = true;
                                    }
                                    me.printToken(me.tokenText);
                                    me.currentMode = 'CONTENT';
                                    lastIsInline = false;
                                    break;
                                case 'TK_TAG_INLINE_END':
                                    me.printToken(me.tokenText);
                                    me.currentMode = 'CONTENT';
                                    lastIsInline = false;
                                    break;
                                case 'TK_TAG_SINGLE':
                                    me.printNewline(false, me.output);
                                    me.printToken(me.tokenText);
                                    me.currentMode = 'CONTENT';
                                    hasContent = true;
                                    break;
                                case 'TK_CONTENT':
                                    hasContent = true;
                                    if (me.tokenText !== '') {
                                        if (lastIsInline) {
                                            hasContent = false;
                                        } else {
                                            me.printNewline(false, me.output);
                                        }
                                        me.printToken(me.tokenText);
                                    } else if (/^TK_TAG_S/.test(me.lastToken)) {
                                        hasContent = false;
                                    }
                                    me.currentMode = 'TAG';
                                    break;
                            }
                            me.lastToken = me.tokenType;
                            me.lastText = me.tokenText;
                        }
                        return me.output.join('');
                    }
                };

                return function (html, indentCharacter, indentSize) {
                    return new HtmlFormater().parse(html, indentCharacter, indentSize); //wrapping functions HtmlFormater
                };
            })(),

            /**
             * 格式化 JavaScript 代码。
             * @param {String} s 要格式化的 JavaScript 代码。
             * @param {Object} options 配置对象。
             *
             *  - indent_char: (String)用于缩进的字符。(默认空格)
             *  - indent_size: (Integer)缩进字符的数目。(默认 4)
             *  - preserve_newlines: (Boolean)保留空行。(默认 true)
             *  - preserve_max_newlines: (Integer)保留空行时，最大保留的空行数。(默认 无限制)
             * 
             * @return {String} 返回格式化后的代码。
             */
            formatJS: (function () {


                /*jslint onevar: false, plusplus: false */
                /*
        
                 JS Beautifier
                ---------------
        
        
                  Written by Einar Lielmanis, <einar@jsbeautifier.org>
                      http://jsbeautifier.org/
        
                  Originally converted to javascript by Vital, <vital76@gmail.com>
                  "End braces on own line" added by Chris J. Shull, <chrisjshull@gmail.com>
        
                  You are free to use this in any way you want, in case you find this useful or working for you.
        
                  Usage:
                    js_beautify(js_source_text);
                    js_beautify(js_source_text, options);
        
                  The options are:
                    indent_size (default 4)          — indentation size,
                    indent_char (default space)      — character to indent with,
                    preserve_newlines (default true) — whether existing line breaks should be preserved,
                    preserve_max_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk,
        
                    jslint_happy (default false) — if true, then jslint-stricter mode is enforced.
        
                            jslint_happy   !jslint_happy
                            ---------------------------------
                             function ()      function()
        
                    brace_style (default "collapse") - "collapse" | "expand" | "end-expand" | "expand-strict"
                            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.
        
                            expand-strict: put brace on own line even in such cases:
        
                                var a =
                                {
                                    a: 5,
                                    b: 6
                                }
                            This mode may break your scripts - e.g "return { a: 1 }" will be broken into two lines, so beware.
        
                    space_before_conditional: should the space before conditional statement be added, "if(true)" vs "if (true)"
        
                    e.g
        
                    js_beautify(js_source_text, {
                      'indent_size': 1,
                      'indent_char': '\t'
                    });
        
        
                */

                function js_beautify(js_source_text, options) {

                    var input, output, token_text, last_type, last_text, last_last_text, last_word, flags, flag_store, indent_string;
                    var whitespace, wordchar, punct, parser_pos, line_starters, digits;
                    var prefix, token_type, do_block_just_closed;
                    var wanted_newline, just_added_newline, n_newlines;
                    var preindent_string = '';


                    // Some interpreters have unexpected results with foo = baz || bar;
                    options = options ? options : {};

                    var opt_brace_style;

                    // compatibility
                    if (options.space_after_anon_function !== undefined && options.jslint_happy === undefined) {
                        options.jslint_happy = options.space_after_anon_function;
                    }
                    if (options.braces_on_own_line !== undefined) { //graceful handling of deprecated option
                        opt_brace_style = options.braces_on_own_line ? "expand" : "collapse";
                    }
                    opt_brace_style = options.brace_style ? options.brace_style : (opt_brace_style ? opt_brace_style : "collapse");


                    var opt_indent_size = options.indent_size ? options.indent_size : 2;
                    var opt_indent_char = options.indent_char ? options.indent_char : '　';
                    var opt_preserve_newlines = typeof options.preserve_newlines === 'undefined' ? true : options.preserve_newlines;
                    var opt_max_preserve_newlines = typeof options.max_preserve_newlines === 'undefined' ? false : options.max_preserve_newlines;
                    var opt_jslint_happy = options.jslint_happy === 'undefined' ? false : options.jslint_happy;
                    var opt_keep_array_indentation = typeof options.keep_array_indentation === 'undefined' ? false : options.keep_array_indentation;
                    var opt_space_before_conditional = typeof options.space_before_conditional === 'undefined' ? true : options.space_before_conditional;
                    var opt_indent_case = typeof options.indent_case === 'undefined' ? false : options.indent_case;
                    var indentation_level_start = options.indent_level || 0;

                    just_added_newline = false;

                    // cache the source's length.
                    var input_length = js_source_text.length;

                    function trim_output(eat_newlines) {
                        eat_newlines = typeof eat_newlines === 'undefined' ? false : eat_newlines;
                        while (output.length && (output[output.length - 1] === ' ' || output[output.length - 1] === indent_string || output[output.length - 1] === preindent_string || (eat_newlines && (output[output.length - 1] === '\n' || output[output.length - 1] === '\r')))) {
                            output.pop();
                        }
                    }

                    function trim(s) {
                        return s.replace(/^\s\s*|\s\s*$/, '');
                    }

                    function force_newline() {
                        var old_keep_array_indentation = opt_keep_array_indentation;
                        opt_keep_array_indentation = false;
                        print_newline()
                        opt_keep_array_indentation = old_keep_array_indentation;
                    }

                    function print_newline(ignore_repeated) {

                        flags.eat_next_space = false;
                        if (opt_keep_array_indentation && is_array(flags.mode)) {
                            return;
                        }

                        ignore_repeated = typeof ignore_repeated === 'undefined' ? true : ignore_repeated;

                        flags.if_line = false;
                        trim_output();

                        if (!output.length) {
                            return; // no newline on start of file
                        }

                        if (output[output.length - 1] !== "\n" || !ignore_repeated) {
                            just_added_newline = true;
                            output.push("\n");
                        }
                        if (preindent_string) {
                            output.push(preindent_string);
                        }
                        for (var i = 0; i < flags.indentation_level; i += 1) {
                            output.push(indent_string);
                        }
                        if (flags.var_line && flags.var_line_reindented) {
                            output.push(indent_string); // skip space-stuffing, if indenting with a tab
                        }
                        if (flags.case_body) {
                            output.push(indent_string);
                        }
                    }

                    function print_single_space() {

                        if (last_type === 'TK_COMMENT') {
                            // no you will not print just a space after a comment
                            return print_newline(true);
                        }

                        if (flags.eat_next_space) {
                            flags.eat_next_space = false;
                            return;
                        }
                        var last_output = ' ';
                        if (output.length) {
                            last_output = output[output.length - 1];
                        }
                        if (last_output !== ' ' && last_output !== '\n' && last_output !== indent_string) { // prevent occassional duplicate space
                            output.push(' ');
                        }
                    }

                    function print_token() {
                        just_added_newline = false;
                        flags.eat_next_space = false;
                        output.push(token_text);
                    }

                    function indent() {
                        flags.indentation_level += 1;
                    }

                    function remove_indent() {
                        if (output.length && output[output.length - 1] === indent_string) {
                            output.pop();
                        }
                    }

                    function set_mode(mode) {
                        if (flags) {
                            flag_store.push(flags);
                        }
                        flags = {
                            previous_mode: flags ? flags.mode : 'BLOCK',
                            mode: mode,
                            var_line: false,
                            var_line_tainted: false,
                            var_line_reindented: false,
                            in_html_comment: false,
                            if_line: false,
                            in_case: false,
                            case_body: false,
                            eat_next_space: false,
                            indentation_baseline: -1,
                            indentation_level: (flags ? flags.indentation_level + (flags.case_body ? 1 : 0) + ((flags.var_line && flags.var_line_reindented) ? 1 : 0) : indentation_level_start),
                            ternary_depth: 0
                        };
                    }

                    function is_array(mode) {
                        return mode === '[EXPRESSION]' || mode === '[INDENTED-EXPRESSION]';
                    }

                    function is_expression(mode) {
                        return in_array(mode, ['[EXPRESSION]', '(EXPRESSION)', '(FOR-EXPRESSION)', '(COND-EXPRESSION)']);
                    }

                    function restore_mode() {
                        do_block_just_closed = flags.mode === 'DO_BLOCK';
                        if (flag_store.length > 0) {
                            var mode = flags.mode;
                            flags = flag_store.pop();
                            flags.previous_mode = mode;
                        }
                    }

                    function all_lines_start_with(lines, c) {
                        for (var i = 0; i < lines.length; i++) {
                            if (trim(lines[i])[0] != c) {
                                return false;
                            }
                        }
                        return true;
                    }

                    function is_special_word(word) {
                        return in_array(word, ['case', 'return', 'do', 'if', 'throw', 'else']);
                    }

                    function in_array(what, arr) {
                        for (var i = 0; i < arr.length; i += 1) {
                            if (arr[i] === what) {
                                return true;
                            }
                        }
                        return false;
                    }

                    function look_up(exclude) {
                        var local_pos = parser_pos;
                        var c = input.charAt(local_pos);
                        while (in_array(c, whitespace) && c != exclude) {
                            local_pos++;
                            if (local_pos >= input_length) return 0;
                            c = input.charAt(local_pos);
                        }
                        return c;
                    }

                    function get_next_token() {
                        n_newlines = 0;

                        if (parser_pos >= input_length) {
                            return ['', 'TK_EOF'];
                        }

                        wanted_newline = false;

                        var c = input.charAt(parser_pos);
                        parser_pos += 1;


                        var keep_whitespace = opt_keep_array_indentation && is_array(flags.mode);

                        if (keep_whitespace) {

                            //
                            // slight mess to allow nice preservation of array indentation and reindent that correctly
                            // first time when we get to the arrays:
                            // var a = [
                            // ....'something'
                            // we make note of whitespace_count = 4 into flags.indentation_baseline
                            // so we know that 4 whitespaces in original source match indent_level of reindented source
                            //
                            // and afterwards, when we get to
                            //    'something,
                            // .......'something else'
                            // we know that this should be indented to indent_level + (7 - indentation_baseline) spaces
                            //
                            var whitespace_count = 0;

                            while (in_array(c, whitespace)) {

                                if (c === "\n") {
                                    trim_output();
                                    output.push("\n");
                                    just_added_newline = true;
                                    whitespace_count = 0;
                                } else {
                                    if (c === '\t') {
                                        whitespace_count += 4;
                                    } else if (c === '\r') {
                                        // nothing
                                    } else {
                                        whitespace_count += 1;
                                    }
                                }

                                if (parser_pos >= input_length) {
                                    return ['', 'TK_EOF'];
                                }

                                c = input.charAt(parser_pos);
                                parser_pos += 1;

                            }
                            if (flags.indentation_baseline === -1) {
                                flags.indentation_baseline = whitespace_count;
                            }

                            if (just_added_newline) {
                                var i;
                                for (i = 0; i < flags.indentation_level + 1; i += 1) {
                                    output.push(indent_string);
                                }
                                if (flags.indentation_baseline !== -1) {
                                    for (i = 0; i < whitespace_count - flags.indentation_baseline; i++) {
                                        output.push(' ');
                                    }
                                }
                            }

                        } else {
                            while (in_array(c, whitespace)) {

                                if (c === "\n") {
                                    n_newlines += ((opt_max_preserve_newlines) ? (n_newlines <= opt_max_preserve_newlines) ? 1 : 0 : 1);
                                }


                                if (parser_pos >= input_length) {
                                    return ['', 'TK_EOF'];
                                }

                                c = input.charAt(parser_pos);
                                parser_pos += 1;

                            }

                            if (opt_preserve_newlines) {
                                if (n_newlines > 1) {
                                    for (i = 0; i < n_newlines; i += 1) {
                                        print_newline(i === 0);
                                        just_added_newline = true;
                                    }
                                }
                            }
                            wanted_newline = n_newlines > 0;
                        }


                        if (in_array(c, wordchar)) {
                            if (parser_pos < input_length) {
                                while (in_array(input.charAt(parser_pos), wordchar)) {
                                    c += input.charAt(parser_pos);
                                    parser_pos += 1;
                                    if (parser_pos === input_length) {
                                        break;
                                    }
                                }
                            }

                            // small and surprisingly unugly hack for 1E-10 representation
                            if (parser_pos !== input_length && c.match(/^[0-9]+[Ee]$/) && (input.charAt(parser_pos) === '-' || input.charAt(parser_pos) === '+')) {

                                var sign = input.charAt(parser_pos);
                                parser_pos += 1;

                                var t = get_next_token(parser_pos);
                                c += sign + t[0];
                                return [c, 'TK_WORD'];
                            }

                            if (c === 'in') { // hack for 'in' operator
                                return [c, 'TK_OPERATOR'];
                            }
                            if (wanted_newline && last_type !== 'TK_OPERATOR' && last_type !== 'TK_EQUALS' && !flags.if_line && (opt_preserve_newlines || last_text !== 'var')) {
                                print_newline();
                            }
                            return [c, 'TK_WORD'];
                        }

                        if (c === '(' || c === '[') {
                            return [c, 'TK_START_EXPR'];
                        }

                        if (c === ')' || c === ']') {
                            return [c, 'TK_END_EXPR'];
                        }

                        if (c === '{') {
                            return [c, 'TK_START_BLOCK'];
                        }

                        if (c === '}') {
                            return [c, 'TK_END_BLOCK'];
                        }

                        if (c === ';') {
                            return [c, 'TK_SEMICOLON'];
                        }

                        if (c === '/') {
                            var comment = '';
                            // peek for comment /* ... */
                            var inline_comment = true;
                            if (input.charAt(parser_pos) === '*') {
                                parser_pos += 1;
                                if (parser_pos < input_length) {
                                    while (!(input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/') && parser_pos < input_length) {
                                        c = input.charAt(parser_pos);
                                        comment += c;
                                        if (c === '\x0d' || c === '\x0a') {
                                            inline_comment = false;
                                        }
                                        parser_pos += 1;
                                        if (parser_pos >= input_length) {
                                            break;
                                        }
                                    }
                                }
                                parser_pos += 2;
                                if (inline_comment && n_newlines == 0) {
                                    return ['/*' + comment + '*/', 'TK_INLINE_COMMENT'];
                                } else {
                                    return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
                                }
                            }
                            // peek for comment // ...
                            if (input.charAt(parser_pos) === '/') {
                                comment = c;
                                while (input.charAt(parser_pos) !== '\r' && input.charAt(parser_pos) !== '\n') {
                                    comment += input.charAt(parser_pos);
                                    parser_pos += 1;
                                    if (parser_pos >= input_length) {
                                        break;
                                    }
                                }
                                parser_pos += 1;
                                if (wanted_newline) {
                                    print_newline();
                                }
                                return [comment, 'TK_COMMENT'];
                            }

                        }

                        if (c === "'" || // string
                        c === '"' || // string
                        (c === '/' && ((last_type === 'TK_WORD' && is_special_word(last_text)) || (last_text === ')' && in_array(flags.previous_mode, ['(COND-EXPRESSION)', '(FOR-EXPRESSION)'])) || (last_type === 'TK_COMMENT' || last_type === 'TK_START_EXPR' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EQUALS' || last_type === 'TK_EOF' || last_type === 'TK_SEMICOLON')))) { // regexp
                            var sep = c;
                            var esc = false;
                            var resulting_string = c;

                            if (parser_pos < input_length) {
                                if (sep === '/') {
                                    //
                                    // handle regexp separately...
                                    //
                                    var in_char_class = false;
                                    while (esc || in_char_class || input.charAt(parser_pos) !== sep) {
                                        resulting_string += input.charAt(parser_pos);
                                        if (!esc) {
                                            esc = input.charAt(parser_pos) === '\\';
                                            if (input.charAt(parser_pos) === '[') {
                                                in_char_class = true;
                                            } else if (input.charAt(parser_pos) === ']') {
                                                in_char_class = false;
                                            }
                                        } else {
                                            esc = false;
                                        }
                                        parser_pos += 1;
                                        if (parser_pos >= input_length) {
                                            // incomplete string/rexp when end-of-file reached.
                                            // bail out with what had been received so far.
                                            return [resulting_string, 'TK_STRING'];
                                        }
                                    }

                                } else {
                                    //
                                    // and handle string also separately
                                    //
                                    while (esc || input.charAt(parser_pos) !== sep) {
                                        resulting_string += input.charAt(parser_pos);
                                        if (!esc) {
                                            esc = input.charAt(parser_pos) === '\\';
                                        } else {
                                            esc = false;
                                        }
                                        parser_pos += 1;
                                        if (parser_pos >= input_length) {
                                            // incomplete string/rexp when end-of-file reached.
                                            // bail out with what had been received so far.
                                            return [resulting_string, 'TK_STRING'];
                                        }
                                    }
                                }



                            }

                            parser_pos += 1;

                            resulting_string += sep;

                            if (sep === '/') {
                                // regexps may have modifiers /regexp/MOD , so fetch those, too
                                while (parser_pos < input_length && in_array(input.charAt(parser_pos), wordchar)) {
                                    resulting_string += input.charAt(parser_pos);
                                    parser_pos += 1;
                                }
                            }
                            return [resulting_string, 'TK_STRING'];
                        }

                        if (c === '#') {


                            if (output.length === 0 && input.charAt(parser_pos) === '!') {
                                // shebang
                                resulting_string = c;
                                while (parser_pos < input_length && c != '\n') {
                                    c = input.charAt(parser_pos);
                                    resulting_string += c;
                                    parser_pos += 1;
                                }
                                output.push(trim(resulting_string) + '\n');
                                print_newline();
                                return get_next_token();
                            }



                            // Spidermonkey-specific sharp variables for circular references
                            // https://developer.mozilla.org/En/Sharp_variables_in_JavaScript
                            // http://mxr.mozilla.org/mozilla-central/source/js/src/jsscan.cpp around line 1935
                            var sharp = '#';
                            if (parser_pos < input_length && in_array(input.charAt(parser_pos), digits)) {
                                do {
                                    c = input.charAt(parser_pos);
                                    sharp += c;
                                    parser_pos += 1;
                                } while (parser_pos < input_length && c !== '#' && c !== '=');
                                if (c === '#') {
                                    //
                                } else if (input.charAt(parser_pos) === '[' && input.charAt(parser_pos + 1) === ']') {
                                    sharp += '[]';
                                    parser_pos += 2;
                                } else if (input.charAt(parser_pos) === '{' && input.charAt(parser_pos + 1) === '}') {
                                    sharp += '{}';
                                    parser_pos += 2;
                                }
                                return [sharp, 'TK_WORD'];
                            }
                        }

                        if (c === '<' && input.substring(parser_pos - 1, parser_pos + 3) === '<!--') {
                            parser_pos += 3;
                            c = '<!--';
                            while (input[parser_pos] != '\n' && parser_pos < input_length) {
                                c += input[parser_pos];
                                parser_pos++;
                            }
                            flags.in_html_comment = true;
                            return [c, 'TK_COMMENT'];
                        }

                        if (c === '-' && flags.in_html_comment && input.substring(parser_pos - 1, parser_pos + 2) === '-->') {
                            flags.in_html_comment = false;
                            parser_pos += 2;
                            if (wanted_newline) {
                                print_newline();
                            }
                            return ['-->', 'TK_COMMENT'];
                        }

                        if (in_array(c, punct)) {
                            while (parser_pos < input_length && in_array(c + input.charAt(parser_pos), punct)) {
                                c += input.charAt(parser_pos);
                                parser_pos += 1;
                                if (parser_pos >= input_length) {
                                    break;
                                }
                            }

                            if (c === '=') {
                                return [c, 'TK_EQUALS'];
                            } else {
                                return [c, 'TK_OPERATOR'];
                            }
                        }

                        return [c, 'TK_UNKNOWN'];
                    }

                    //----------------------------------
                    indent_string = '';
                    while (opt_indent_size > 0) {
                        indent_string += opt_indent_char;
                        opt_indent_size -= 1;
                    }

                    while (js_source_text && (js_source_text[0] === ' ' || js_source_text[0] === '\t')) {
                        preindent_string += js_source_text[0];
                        js_source_text = js_source_text.substring(1);
                    }
                    input = js_source_text;

                    last_word = ''; // last 'TK_WORD' passed
                    last_type = 'TK_START_EXPR'; // last token type
                    last_text = ''; // last token text
                    last_last_text = ''; // pre-last token text
                    output = [];

                    do_block_just_closed = false;

                    whitespace = "\n\r\t ".split('');
                    wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
                    digits = '0123456789'.split('');

                    punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |= ::';
                    punct += ' <%= <% %> <?= <? ?>'; // try to be a good boy and try not to break the markup language identifiers
                    punct = punct.split(' ');

                    // words which should always start on new line.
                    line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');

                    // states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
                    // some formatting depends on that.
                    flag_store = [];
                    set_mode('BLOCK');

                    parser_pos = 0;
                    while (true) {
                        var t = get_next_token(parser_pos);
                        token_text = t[0];
                        token_type = t[1];
                        if (token_type === 'TK_EOF') {
                            break;
                        }

                        switch (token_type) {

                            case 'TK_START_EXPR':

                                if (token_text === '[') {

                                    if (last_type === 'TK_WORD' || last_text === ')') {
                                        // this is array index specifier, break immediately
                                        // a[x], fn()[x]
                                        if (in_array(last_text, line_starters)) {
                                            print_single_space();
                                        }
                                        set_mode('(EXPRESSION)');
                                        print_token();
                                        break;
                                    }

                                    if (flags.mode === '[EXPRESSION]' || flags.mode === '[INDENTED-EXPRESSION]') {
                                        if (last_last_text === ']' && last_text === ',') {
                                            // ], [ goes to new line
                                            if (flags.mode === '[EXPRESSION]') {
                                                flags.mode = '[INDENTED-EXPRESSION]';
                                                if (!opt_keep_array_indentation) {
                                                    indent();
                                                }
                                            }
                                            set_mode('[EXPRESSION]');
                                            if (!opt_keep_array_indentation) {
                                                print_newline();
                                            }
                                        } else if (last_text === '[') {
                                            if (flags.mode === '[EXPRESSION]') {
                                                flags.mode = '[INDENTED-EXPRESSION]';
                                                if (!opt_keep_array_indentation) {
                                                    indent();
                                                }
                                            }
                                            set_mode('[EXPRESSION]');

                                            if (!opt_keep_array_indentation) {
                                                print_newline();
                                            }
                                        } else {
                                            set_mode('[EXPRESSION]');
                                        }
                                    } else {
                                        set_mode('[EXPRESSION]');
                                    }



                                } else {
                                    if (last_word === 'for') {
                                        set_mode('(FOR-EXPRESSION)');
                                    } else if (in_array(last_word, ['if', 'while'])) {
                                        set_mode('(COND-EXPRESSION)');
                                    } else {
                                        set_mode('(EXPRESSION)');
                                    }
                                }

                                if (last_text === ';' || last_type === 'TK_START_BLOCK') {
                                    print_newline();
                                } else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || last_text === '.') {
                                    if (wanted_newline) {
                                        print_newline();
                                    }
                                    // do nothing on (( and )( and ][ and ]( and .(
                                } else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
                                    print_single_space();
                                } else if (last_word === 'function' || last_word === 'typeof') {
                                    // function() vs function ()
                                    if (opt_jslint_happy) {
                                        print_single_space();
                                    }
                                } else if (in_array(last_text, line_starters) || last_text === 'catch') {
                                    if (opt_space_before_conditional) {
                                        print_single_space();
                                    }
                                }
                                print_token();

                                break;

                            case 'TK_END_EXPR':
                                if (token_text === ']') {
                                    if (opt_keep_array_indentation) {
                                        if (last_text === '}') {
                                            // trim_output();
                                            // print_newline(true);
                                            remove_indent();
                                            print_token();
                                            restore_mode();
                                            break;
                                        }
                                    } else {
                                        if (flags.mode === '[INDENTED-EXPRESSION]') {
                                            if (last_text === ']') {
                                                restore_mode();
                                                print_newline();
                                                print_token();
                                                break;
                                            }
                                        }
                                    }
                                }
                                restore_mode();
                                print_token();
                                break;

                            case 'TK_START_BLOCK':

                                if (last_word === 'do') {
                                    set_mode('DO_BLOCK');
                                } else {
                                    set_mode('BLOCK');
                                }
                                if (opt_brace_style == "expand" || opt_brace_style == "expand-strict") {
                                    var empty_braces = false;
                                    if (opt_brace_style == "expand-strict") {
                                        empty_braces = (look_up() == '}');
                                        if (!empty_braces) {
                                            print_newline(true);
                                        }
                                    } else {
                                        if (last_type !== 'TK_OPERATOR') {
                                            if (last_text === '=' || (is_special_word(last_text) && last_text !== 'else')) {
                                                print_single_space();
                                            } else {
                                                print_newline(true);
                                            }
                                        }
                                    }
                                    print_token();
                                    if (!empty_braces) indent();
                                } else {
                                    if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
                                        if (last_type === 'TK_START_BLOCK') {
                                            print_newline();
                                        } else {
                                            print_single_space();
                                        }
                                    } else {
                                        // if TK_OPERATOR or TK_START_EXPR
                                        if (is_array(flags.previous_mode) && last_text === ',') {
                                            if (last_last_text === '}') {
                                                // }, { in array context
                                                print_single_space();
                                            } else {
                                                print_newline(); // [a, b, c, {
                                            }
                                        }
                                    }
                                    indent();
                                    print_token();
                                }

                                break;

                            case 'TK_END_BLOCK':
                                restore_mode();
                                if (opt_brace_style == "expand" || opt_brace_style == "expand-strict") {
                                    if (last_text !== '{') {
                                        print_newline();
                                    }
                                    print_token();
                                } else {
                                    if (last_type === 'TK_START_BLOCK') {
                                        // nothing
                                        if (just_added_newline) {
                                            remove_indent();
                                        } else {
                                            // {}
                                            trim_output();
                                        }
                                    } else {
                                        if (is_array(flags.mode) && opt_keep_array_indentation) {
                                            // we REALLY need a newline here, but newliner would skip that
                                            opt_keep_array_indentation = false;
                                            print_newline();
                                            opt_keep_array_indentation = true;

                                        } else {
                                            print_newline();
                                        }
                                    }
                                    print_token();
                                }
                                break;

                            case 'TK_WORD':

                                // no, it's not you. even I have problems understanding how this works
                                // and what does what.
                                if (do_block_just_closed) {
                                    // do {} ## while ()
                                    print_single_space();
                                    print_token();
                                    print_single_space();
                                    do_block_just_closed = false;
                                    break;
                                }

                                if (token_text === 'function') {
                                    if (flags.var_line) {
                                        flags.var_line_reindented = true;
                                    }
                                    if ((just_added_newline || last_text === ';') && last_text !== '{' && last_type != 'TK_BLOCK_COMMENT' && last_type != 'TK_COMMENT') {
                                        // make sure there is a nice clean space of at least one blank line
                                        // before a new function definition
                                        n_newlines = just_added_newline ? n_newlines : 0;
                                        if (!opt_preserve_newlines) {
                                            n_newlines = 1;
                                        }

                                        for (var i = 0; i < 2 - n_newlines; i++) {
                                            print_newline(false);
                                        }
                                    }
                                }

                                if (token_text === 'case' || token_text === 'default') {
                                    if (last_text === ':' || flags.case_body) {
                                        // switch cases following one another
                                        remove_indent();
                                    } else {
                                        // case statement starts in the same line where switch
                                        if (!opt_indent_case) flags.indentation_level--;
                                        print_newline();
                                        if (!opt_indent_case) flags.indentation_level++;
                                    }
                                    print_token();
                                    flags.in_case = true;
                                    flags.case_body = false;
                                    break;
                                }

                                prefix = 'NONE';

                                if (last_type === 'TK_END_BLOCK') {

                                    if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                                        prefix = 'NEWLINE';
                                    } else {
                                        if (opt_brace_style == "expand" || opt_brace_style == "end-expand" || opt_brace_style == "expand-strict") {
                                            prefix = 'NEWLINE';
                                        } else {
                                            prefix = 'SPACE';
                                            print_single_space();
                                        }
                                    }
                                } else if (last_type === 'TK_SEMICOLON' && (flags.mode === 'BLOCK' || flags.mode === 'DO_BLOCK')) {
                                    prefix = 'NEWLINE';
                                } else if (last_type === 'TK_SEMICOLON' && is_expression(flags.mode)) {
                                    prefix = 'SPACE';
                                } else if (last_type === 'TK_STRING') {
                                    prefix = 'NEWLINE';
                                } else if (last_type === 'TK_WORD') {
                                    if (last_text === 'else') {
                                        // eat newlines between ...else *** some_op...
                                        // won't preserve extra newlines in this place (if any), but don't care that much
                                        trim_output(true);
                                    }
                                    prefix = 'SPACE';
                                } else if (last_type === 'TK_START_BLOCK') {
                                    prefix = 'NEWLINE';
                                } else if (last_type === 'TK_END_EXPR') {
                                    print_single_space();
                                    prefix = 'NEWLINE';
                                }

                                if (in_array(token_text, line_starters) && last_text !== ')') {
                                    if (last_text == 'else') {
                                        prefix = 'SPACE';
                                    } else {
                                        prefix = 'NEWLINE';
                                    }

                                    if (token_text === 'function' && (last_text === 'get' || last_text === 'set')) {
                                        prefix = 'SPACE';
                                    }
                                }

                                if (flags.if_line && last_type === 'TK_END_EXPR') {
                                    flags.if_line = false;
                                }
                                if (in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                                    if (last_type !== 'TK_END_BLOCK' || opt_brace_style == "expand" || opt_brace_style == "end-expand" || opt_brace_style == "expand-strict") {
                                        print_newline();
                                    } else {
                                        trim_output(true);
                                        print_single_space();
                                    }
                                } else if (prefix === 'NEWLINE') {
                                    if ((last_type === 'TK_START_EXPR' || last_text === '=' || last_text === ',') && token_text === 'function') {
                                        // no need to force newline on 'function': (function
                                        // DONOTHING
                                    } else if (token_text === 'function' && last_text == 'new') {
                                        print_single_space();
                                    } else if (is_special_word(last_text)) {
                                        // no newline between 'return nnn'
                                        print_single_space();
                                    } else if (last_type !== 'TK_END_EXPR') {
                                        if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
                                            // no need to force newline on 'var': for (var x = 0...)
                                            if (token_text === 'if' && last_word === 'else' && last_text !== '{') {
                                                // no newline for } else if {
                                                print_single_space();
                                            } else {
                                                flags.var_line = false;
                                                flags.var_line_reindented = false;
                                                print_newline();
                                            }
                                        }
                                    } else if (in_array(token_text, line_starters) && last_text != ')') {
                                        flags.var_line = false;
                                        flags.var_line_reindented = false;
                                        print_newline();
                                    }
                                } else if (is_array(flags.mode) && last_text === ',' && last_last_text === '}') {
                                    print_newline(); // }, in lists get a newline treatment
                                } else if (prefix === 'SPACE') {
                                    print_single_space();
                                }
                                print_token();
                                last_word = token_text;

                                if (token_text === 'var') {
                                    flags.var_line = true;
                                    flags.var_line_reindented = false;
                                    flags.var_line_tainted = false;
                                }

                                if (token_text === 'if') {
                                    flags.if_line = true;
                                }
                                if (token_text === 'else') {
                                    flags.if_line = false;
                                }

                                break;

                            case 'TK_SEMICOLON':

                                print_token();
                                flags.var_line = false;
                                flags.var_line_reindented = false;
                                if (flags.mode == 'OBJECT') {
                                    // OBJECT mode is weird and doesn't get reset too well.
                                    flags.mode = 'BLOCK';
                                }
                                break;

                            case 'TK_STRING':

                                if (last_type === 'TK_END_EXPR' && in_array(flags.previous_mode, ['(COND-EXPRESSION)', '(FOR-EXPRESSION)'])) {
                                    print_single_space();
                                } else if (last_type == 'TK_STRING' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_SEMICOLON') {
                                    print_newline();
                                } else if (last_type === 'TK_WORD') {
                                    print_single_space();
                                }
                                print_token();
                                break;

                            case 'TK_EQUALS':
                                if (flags.var_line) {
                                    // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
                                    flags.var_line_tainted = true;
                                }
                                print_single_space();
                                print_token();
                                print_single_space();
                                break;

                            case 'TK_OPERATOR':

                                var space_before = true;
                                var space_after = true;

                                if (flags.var_line && token_text === ',' && (is_expression(flags.mode))) {
                                    // do not break on comma, for(var a = 1, b = 2)
                                    flags.var_line_tainted = false;
                                }

                                if (flags.var_line) {
                                    if (token_text === ',') {
                                        if (flags.var_line_tainted) {
                                            print_token();
                                            flags.var_line_reindented = true;
                                            flags.var_line_tainted = false;
                                            print_newline();
                                            break;
                                        } else {
                                            flags.var_line_tainted = false;
                                        }
                                        // } else if (token_text === ':') {
                                        // hmm, when does this happen? tests don't catch this
                                        // flags.var_line = false;
                                    }
                                }

                                if (is_special_word(last_text)) {
                                    // "return" had a special handling in TK_WORD. Now we need to return the favor
                                    print_single_space();
                                    print_token();
                                    break;
                                }

                                if (token_text === ':' && flags.in_case) {
                                    if (opt_indent_case) flags.case_body = true;
                                    print_token(); // colon really asks for separate treatment
                                    print_newline();
                                    flags.in_case = false;
                                    break;
                                }

                                if (token_text === '::') {
                                    // no spaces around exotic namespacing syntax operator
                                    print_token();
                                    break;
                                }

                                if (token_text === ',') {
                                    if (flags.var_line) {
                                        if (flags.var_line_tainted) {
                                            print_token();
                                            print_newline();
                                            flags.var_line_tainted = false;
                                        } else {
                                            print_token();
                                            print_single_space();
                                        }
                                    } else if (last_type === 'TK_END_BLOCK' && flags.mode !== "(EXPRESSION)") {
                                        print_token();
                                        if (flags.mode === 'OBJECT' && last_text === '}') {
                                            print_newline();
                                        } else {
                                            print_single_space();
                                        }
                                    } else {
                                        if (flags.mode === 'OBJECT') {
                                            print_token();
                                            print_newline();
                                        } else {
                                            // EXPR or DO_BLOCK
                                            print_token();
                                            print_single_space();
                                        }
                                    }
                                    break;
                                    // } else if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS']) || in_array(last_text, line_starters) || in_array(last_text, ['==', '!=', '+=', '-=', '*=', '/=', '+', '-'])))) {
                                } else if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS', 'TK_OPERATOR']) || in_array(last_text, line_starters)))) {
                                    // unary operators (and binary +/- pretending to be unary) special cases
                                    space_before = false;
                                    space_after = false;

                                    if (last_text === ';' && is_expression(flags.mode)) {
                                        // for (;; ++i)
                                        //        ^^^
                                        space_before = true;
                                    }
                                    if (last_type === 'TK_WORD' && in_array(last_text, line_starters)) {
                                        space_before = true;
                                    }

                                    if (flags.mode === 'BLOCK' && (last_text === '{' || last_text === ';')) {
                                        // { foo; --i }
                                        // foo(); --bar;
                                        print_newline();
                                    }
                                } else if (token_text === '.') {
                                    // decimal digits or object.property
                                    space_before = false;

                                } else if (token_text === ':') {
                                    if (flags.ternary_depth == 0) {
                                        flags.mode = 'OBJECT';
                                        space_before = false;
                                    } else {
                                        flags.ternary_depth -= 1;
                                    }
                                } else if (token_text === '?') {
                                    flags.ternary_depth += 1;
                                }
                                if (space_before) {
                                    print_single_space();
                                }

                                print_token();

                                if (space_after) {
                                    print_single_space();
                                }

                                if (token_text === '!') {
                                    // flags.eat_next_space = true;
                                }

                                break;

                            case 'TK_BLOCK_COMMENT':

                                var lines = token_text.split(/\x0a|\x0d\x0a/);

                                if (all_lines_start_with(lines.slice(1), '*')) {
                                    // javadoc: reformat and reindent
                                    print_newline();
                                    output.push(lines[0]);
                                    for (i = 1; i < lines.length; i++) {
                                        print_newline();
                                        output.push(' ');
                                        output.push(trim(lines[i]));
                                    }

                                } else {

                                    // simple block comment: leave intact
                                    if (lines.length > 1) {
                                        // multiline comment block starts with a new line
                                        print_newline();
                                    } else {
                                        // single-line /* comment */ stays where it is
                                        if (last_type === 'TK_END_BLOCK') {
                                            print_newline();
                                        } else {
                                            print_single_space();
                                        }

                                    }

                                    for (i = 0; i < lines.length; i++) {
                                        output.push(lines[i]);
                                        output.push('\n');
                                    }

                                }
                                if (look_up('\n') != '\n') print_newline();
                                break;

                            case 'TK_INLINE_COMMENT':
                                print_single_space();
                                print_token();
                                if (is_expression(flags.mode)) {
                                    print_single_space();
                                } else {
                                    force_newline();
                                }
                                break;

                            case 'TK_COMMENT':

                                // print_newline();
                                if (wanted_newline) {
                                    print_newline();
                                } else {
                                    print_single_space();
                                }
                                print_token();
                                if (look_up('\n') != '\n') force_newline();
                                break;

                            case 'TK_UNKNOWN':
                                if (is_special_word(last_text)) {
                                    print_single_space();
                                }
                                print_token();
                                break;
                        }

                        last_last_text = last_text;
                        last_type = token_type;
                        last_text = token_text;
                    }

                    var sweet_code = preindent_string + output.join('').replace(/[\n ]+$/, '');
                    return sweet_code;

                }

                return js_beautify;
            })()

        },

        /**代码高亮模块*/
        SyntaxHighligher: (function () {
            // Copyright (C) 2012 xuld
            //
            // Licensed under the Apache License, Version 2.0 (the "License");
            // you may not use this file except in compliance with the License.
            // You may obtain a copy of the License at
            //
            //      http://www.apache.org/licenses/LICENSE-2.0
            //
            // Unless required by applicable law or agreed to in writing, software
            // distributed under the License is distributed on an "AS IS" BASIS,
            // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
            // See the License for the specific language governing permissions and
            // limitations under the License.

            /**
             * @namespace SyntaxHighligher
             */
            var SH = {

                /**
                 * 所有可用的刷子。
                 */
                brushes: {
                    none: function (sourceCode, position) {
                        return [position, 'plain'];
                    }
                },

                /**
                 * 创建一个用于指定规则的语法刷子。
                 * @param {Array} stylePatterns 匹配的正则列表，格式为：。
                 * [[css样式名1, 正则1, 可选的头字符], [css样式名2, 正则2], ...]
                 * 其中，可选的头字符是这个匹配格式的简化字符，如果源码以这个字符里的任何字符打头，表示自动匹配这个正则。
                 * @return {Function} 返回一个刷子函数。刷子函数的输入为：
                 *
                 * - sourceCode {String} 要处理的源码。
                 * - position {Number} 要开始处理的位置。
                 *
                 * 返回值为一个数组，格式为。
                 * [位置1, 样式1, 位置2, 样式2, ..., 位置n-1, 样式n-1]
                 *
                 * 表示源码中， 位置n-1 到 位置n 之间应用样式n-1
                 */
                createBrush: function (stylePatterns) {
                    var shortcuts = {},
                        tokenizer, stylePatternsStart = 0,
                        stylePatternsEnd = stylePatterns.length;
                    (function () {
                        var allRegexs = [],
                            i, stylePattern, shortcutChars, c;
                        for (i = 0; i < stylePatternsEnd; i++) {
                            stylePattern = stylePatterns[i];
                            if ((shortcutChars = stylePattern[2])) {
                                for (c = shortcutChars.length; --c >= 0;) {
                                    shortcuts[shortcutChars.charAt(c)] = stylePattern;
                                }

                                if (i == stylePatternsStart) stylePatternsStart++;
                            }
                            allRegexs.push(stylePattern[1]);
                        }
                        allRegexs.push(/[\0-\uffff]/);
                        tokenizer = combinePrefixPatterns(allRegexs);
                    })();

                    function decorate(sourceCode, position) {
                        /** Even entries are positions in source in ascending order.  Odd enties
                         * are style markers (e.g., COMMENT) that run from that position until
                         * the end.
                         * @type {Array<number/string>}
                         */
                        var decorations = [position, 'plain'],
                            tokens = sourceCode.match(tokenizer) || [],
                            pos = 0,
                            // index into sourceCode
                            styleCache = {},
                            ti = 0,
                            nTokens = tokens.length,
                            token, style, match, isEmbedded, stylePattern;

                        while (ti < nTokens) {
                            token = tokens[ti++];

                            if (styleCache.hasOwnProperty(token)) {
                                style = styleCache[token];
                                isEmbedded = false;
                            } else {

                                // 测试 shortcuts。
                                stylePattern = shortcuts[token.charAt(0)];
                                if (stylePattern) {
                                    match = token.match(stylePattern[1]);
                                    style = stylePattern[0];
                                } else {
                                    for (var i = stylePatternsStart; i < stylePatternsEnd; ++i) {
                                        stylePattern = stylePatterns[i];
                                        match = token.match(stylePattern[1]);
                                        if (match) {
                                            style = stylePattern[0];
                                            break;
                                        }
                                    }

                                    if (!match) { // make sure that we make progress
                                        style = 'plain';
                                    }
                                }

                                if (style in SH.brushes) {
                                    if (style === 'none') {
                                        style = SH.guessLanguage(match[1]);
                                    }
                                    style = SH.brushes[style];
                                }

                                isEmbedded = typeof style === 'function';

                                if (!isEmbedded) {
                                    styleCache[token] = style;
                                }
                            }

                            if (isEmbedded) {
                                // Treat group 1 as an embedded block of source code.
                                var embeddedSource = match[1];
                                var embeddedSourceStart = token.indexOf(embeddedSource);
                                var embeddedSourceEnd = embeddedSourceStart + embeddedSource.length;
                                if (match[2]) {
                                    // If embeddedSource can be blank, then it would match at the
                                    // beginning which would cause us to infinitely recurse on the
                                    // entire token, so we catch the right context in match[2].
                                    embeddedSourceEnd = token.length - match[2].length;
                                    embeddedSourceStart = embeddedSourceEnd - embeddedSource.length;
                                }

                                // Decorate the left of the embedded source
                                appendDecorations(position + pos, token.substring(0, embeddedSourceStart), decorate, decorations);
                                // Decorate the embedded source
                                appendDecorations(position + pos + embeddedSourceStart, embeddedSource, style, decorations);
                                // Decorate the right of the embedded section
                                appendDecorations(position + pos + embeddedSourceEnd, token.substring(embeddedSourceEnd), decorate, decorations);
                            } else {
                                decorations.push(position + pos, style);
                            }
                            pos += token.length;
                        }


                        removeEmptyAndNestedDecorations(decorations);
                        return decorations;
                    };

                    return decorate;
                },

                /**
                 * 根据源码猜测对应的刷子。
                 * @param {String} sourceCode 需要高亮的源码。
                 * @return {String} 返回一个语言名。
                 */
                guessLanguage: function (sourceCode) {
                    // Treat it as markup if the first non whitespace character is a < and
                    // the last non-whitespace character is a >.
                    return /^\s*</.test(sourceCode) ? 'xml' : 'default';
                },

                /**
                 * 搜索用于处理指定语言的刷子。
                 * @param {String} language 要查找的语言名。
                 * @return {Function} 返回一个刷子，用于高亮指定的源码。
                 */
                findBrush: function (language) {
                    return SH.brushes[language] || SH.brushes.none;
                },

                /**
                 * 注册一个语言的刷子。
                 * @param {String} language 要注册的语言名。
                 * @param {Array} stylePatterns 匹配的正则列表。见 {@link SyntaxHighligher.createBrush}
                 * @return {Function} 返回一个刷子，用于高亮指定的源码。
                 */
                register: function (language, stylePatterns) {
                    language = language.split(' ');
                    stylePatterns = SH.createBrush(stylePatterns);
                    for (var i = 0; i < language.length; i++) {
                        SH.brushes[language[i]] = stylePatterns;
                    }
                }

            };

            // CAVEAT: this does not properly handle the case where a regular
            // expression immediately follows another since a regular expression may
            // have flags for case-sensitivity and the like.  Having regexp tokens
            // adjacent is not valid in any language I'm aware of, so I'm punting.
            // TODO: maybe style special characters inside a regexp as punctuation.

            /**
             * Given a group of {@link RegExp}s, returns a {@code RegExp} that globally
             * matches the union of the sets of strings matched by the input RegExp.
             * Since it matches globally, if the input strings have a start-of-input
             * anchor (/^.../), it is ignored for the purposes of unioning.
             * @param {Array.<RegExp>} regexs non multiline, non-global regexs.
             * @return {RegExp} a global regex.
             */
            function combinePrefixPatterns(regexs) {
                var capturedGroupIndex = 0;

                var needToFoldCase = false;
                var ignoreCase = false;
                for (var i = 0, n = regexs.length; i < n; ++i) {
                    var regex = regexs[i];
                    if (regex.ignoreCase) {
                        ignoreCase = true;
                    } else if (/[a-z]/i.test(regex.source.replace(/\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, ''))) {
                        needToFoldCase = true;
                        ignoreCase = false;
                        break;
                    }
                }

                function allowAnywhereFoldCaseAndRenumberGroups(regex) {
                    // Split into character sets, escape sequences, punctuation strings
                    // like ('(', '(?:', ')', '^'), and runs of characters that do not
                    // include any of the above.
                    var parts = regex.source.match(
                    new RegExp('(?:' + '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]' // a character set
                    +
                    '|\\\\u[A-Fa-f0-9]{4}' // a unicode escape
                    +
                    '|\\\\x[A-Fa-f0-9]{2}' // a hex escape
                    +
                    '|\\\\[0-9]+' // a back-reference or octal escape
                    +
                    '|\\\\[^ux0-9]' // other escape sequence
                    +
                    '|\\(\\?[:!=]' // start of a non-capturing group
                    +
                    '|[\\(\\)\\^]' // start/emd of a group, or line start
                    +
                    '|[^\\x5B\\x5C\\(\\)\\^]+' // run of other characters
                    +
                    ')', 'g'));
                    var n = parts.length;

                    // Maps captured group numbers to the number they will occupy in
                    // the output or to -1 if that has not been determined, or to
                    // undefined if they need not be capturing in the output.
                    var capturedGroups = [];

                    // Walk over and identify back references to build the capturedGroups
                    // mapping.
                    for (var i = 0, groupIndex = 0; i < n; ++i) {
                        var p = parts[i];
                        if (p === '(') {
                            // groups are 1-indexed, so max group index is count of '('
                            ++groupIndex;
                        } else if ('\\' === p.charAt(0)) {
                            var decimalValue = +p.substring(1);
                            if (decimalValue && decimalValue <= groupIndex) {
                                capturedGroups[decimalValue] = -1;
                            }
                        }
                    }

                    // Renumber groups and reduce capturing groups to non-capturing groups
                    // where possible.
                    for (var i = 1; i < capturedGroups.length; ++i) {
                        if (-1 === capturedGroups[i]) {
                            capturedGroups[i] = ++capturedGroupIndex;
                        }
                    }
                    for (var i = 0, groupIndex = 0; i < n; ++i) {
                        var p = parts[i];
                        if (p === '(') {
                            ++groupIndex;
                            if (capturedGroups[groupIndex] === undefined) {
                                parts[i] = '(?:';
                            }
                        } else if ('\\' === p.charAt(0)) {
                            var decimalValue = +p.substring(1);
                            if (decimalValue && decimalValue <= groupIndex) {
                                parts[i] = '\\' + capturedGroups[groupIndex];
                            }
                        }
                    }

                    // Remove any prefix anchors so that the output will match anywhere.
                    // ^^ really does mean an anchored match though.
                    for (var i = 0, groupIndex = 0; i < n; ++i) {
                        if ('^' === parts[i] && '^' !== parts[i + 1]) {
                            parts[i] = '';
                        }
                    }

                    // Expand letters to groups to handle mixing of case-sensitive and
                    // case-insensitive patterns if necessary.
                    if (regex.ignoreCase && needToFoldCase) {
                        for (var i = 0; i < n; ++i) {
                            var p = parts[i];
                            var ch0 = p.charAt(0);
                            if (p.length >= 2 && ch0 === '[') {
                                parts[i] = caseFoldCharset(p);
                            } else if (ch0 !== '\\') {
                                // TODO: handle letters in numeric escapes.
                                parts[i] = p.replace(/[a-zA-Z]/g, function (ch) {
                                    var cc = ch.charCodeAt(0);
                                    return '[' + String.fromCharCode(cc & ~32, cc | 32) + ']';
                                });
                            }
                        }
                    }

                    return parts.join('');
                }

                var rewritten = [];
                for (var i = 0, n = regexs.length; i < n; ++i) {
                    var regex = regexs[i];
                    if (regex.global || regex.multiline) {
                        throw new Error('' + regex);
                    }
                    rewritten.push('(?:' + allowAnywhereFoldCaseAndRenumberGroups(regex) + ')');
                }

                return new RegExp(rewritten.join('|'), ignoreCase ? 'gi' : 'g');
            }

            function encodeEscape(charCode) {
                if (charCode < 0x20) {
                    return (charCode < 0x10 ? '\\x0' : '\\x') + charCode.toString(16);
                }
                var ch = String.fromCharCode(charCode);
                if (ch === '\\' || ch === '-' || ch === '[' || ch === ']') {
                    ch = '\\' + ch;
                }
                return ch;
            }

            var escapeCharToCodeUnit = {
                'b': 8,
                't': 9,
                'n': 0xa,
                'v': 0xb,
                'f': 0xc,
                'r': 0xd
            };

            function decodeEscape(charsetPart) {
                var cc0 = charsetPart.charCodeAt(0);
                if (cc0 !== 92 /* \\ */) {
                    return cc0;
                }
                var c1 = charsetPart.charAt(1);
                cc0 = escapeCharToCodeUnit[c1];
                if (cc0) {
                    return cc0;
                } else if ('0' <= c1 && c1 <= '7') {
                    return parseInt(charsetPart.substring(1), 8);
                } else if (c1 === 'u' || c1 === 'x') {
                    return parseInt(charsetPart.substring(2), 16);
                } else {
                    return charsetPart.charCodeAt(1);
                }
            }

            function caseFoldCharset(charSet) {
                var charsetParts = charSet.substring(1, charSet.length - 1).match(
                new RegExp('\\\\u[0-9A-Fa-f]{4}' + '|\\\\x[0-9A-Fa-f]{2}' + '|\\\\[0-3][0-7]{0,2}' + '|\\\\[0-7]{1,2}' + '|\\\\[\\s\\S]' + '|-' + '|[^-\\\\]', 'g'));
                var groups = [];
                var ranges = [];
                var inverse = charsetParts[0] === '^';
                for (var i = inverse ? 1 : 0, n = charsetParts.length; i < n; ++i) {
                    var p = charsetParts[i];
                    if (/\\[bdsw]/i.test(p)) { // Don't muck with named groups.
                        groups.push(p);
                    } else {
                        var start = decodeEscape(p);
                        var end;
                        if (i + 2 < n && '-' === charsetParts[i + 1]) {
                            end = decodeEscape(charsetParts[i + 2]);
                            i += 2;
                        } else {
                            end = start;
                        }
                        ranges.push([start, end]);
                        // If the range might intersect letters, then expand it.
                        // This case handling is too simplistic.
                        // It does not deal with non-latin case folding.
                        // It works for latin source code identifiers though.
                        if (!(end < 65 || start > 122)) {
                            if (!(end < 65 || start > 90)) {
                                ranges.push([Math.max(65, start) | 32, Math.min(end, 90) | 32]);
                            }
                            if (!(end < 97 || start > 122)) {
                                ranges.push([Math.max(97, start) & ~32, Math.min(end, 122) & ~32]);
                            }
                        }
                    }
                }

                // [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]]
                // -> [[1, 12], [14, 14], [16, 17]]
                ranges.sort(function (a, b) {
                    return (a[0] - b[0]) || (b[1] - a[1]);
                });
                var consolidatedRanges = [];
                var lastRange = [NaN, NaN];
                for (var i = 0; i < ranges.length; ++i) {
                    var range = ranges[i];
                    if (range[0] <= lastRange[1] + 1) {
                        lastRange[1] = Math.max(lastRange[1], range[1]);
                    } else {
                        consolidatedRanges.push(lastRange = range);
                    }
                }

                var out = ['['];
                if (inverse) {
                    out.push('^');
                }
                out.push.apply(out, groups);
                for (var i = 0; i < consolidatedRanges.length; ++i) {
                    var range = consolidatedRanges[i];
                    out.push(encodeEscape(range[0]));
                    if (range[1] > range[0]) {
                        if (range[1] + 1 > range[0]) {
                            out.push('-');
                        }
                        out.push(encodeEscape(range[1]));
                    }
                }
                out.push(']');
                return out.join('');
            }

            /**
             * Apply the given language handler to sourceCode and add the resulting
             * decorations to out.
             * @param {number} basePos the index of sourceCode within the chunk of source
             *    whose decorations are already present on out.
             */
            function appendDecorations(basePos, sourceCode, brush, out) {
                if (sourceCode) {
                    out.push.apply(out, brush(sourceCode, basePos));
                }
            }

            /**
             * 删除空的位置和相邻的位置。
             */
            function removeEmptyAndNestedDecorations(decorations) {
                for (var srcIndex = 0, destIndex = 0, length = decorations.length, lastPos, lastStyle; srcIndex < length;) {

                    // 如果上一个长度和当前长度相同，或者上一个样式和现在的相同，则跳过。
                    if (lastPos === decorations[srcIndex]) {
                        srcIndex++;
                        decorations[destIndex - 1] = lastStyle = decorations[srcIndex++];
                    } else if (lastStyle === decorations[srcIndex + 1]) {
                        srcIndex += 2;
                    } else {
                        decorations[destIndex++] = lastPos = decorations[srcIndex++];
                        decorations[destIndex++] = lastStyle = decorations[srcIndex++];
                    }
                };

                decorations.length = destIndex;

            }

            /**
             * 高亮单一的节点。
             * @param {Element} elem 要高亮的节点。
             * @param {String} [language] 语言本身。系统会自动根据源码猜测语言。
             * @param {Number} lineNumberStart=null 第一行的计数，如果是null，则不显示行号。
             */
            SH.one = function (pre, language, lineNumberStart) {

                // Extract tags, and convert the source code to plain text.
                var sourceAndSpans = extractSourceSpans(pre),
                    specificLanuage = (pre.className.match(/\bsh-(\w+)(?!\S)/i) || [0, null])[1];

                // 自动决定 language 和 lineNumbers
                if (!language) {
                    language = specificLanuage || SH.guessLanguage(sourceAndSpans.sourceCode);
                }

                if (!specificLanuage) {
                    pre.className += ' sh-' + language;
                }

                // Apply the appropriate language handler
                // Integrate the decorations and tags back into the source code,
                // modifying the sourceNode in place.
                recombineTagsAndDecorations(sourceAndSpans, SH.findBrush(language)(sourceAndSpans.sourceCode, 0));
            };

            /**
             * Split markup into a string of source code and an array mapping ranges in
             * that string to the text nodes in which they appear.
             *
             * <p>
             * The HTML DOM structure:</p>
             * <pre>
             * (Element   "p"
             *   (Element "b"
             *     (Text  "print "))       ; #1
             *   (Text    "'Hello '")      ; #2
             *   (Element "br")            ; #3
             *   (Text    "  + 'World';")) ; #4
             * </pre>
             * <p>
             * corresponds to the HTML
             * {@code <p><b>print </b>'Hello '<br>  + 'World';</p>}.</p>
             *
             * <p>
             * It will produce the output:</p>
             * <pre>
             * {
             *   sourceCode: "print 'Hello '\n  + 'World';",
             *   //              1         2
             *   //       012345678901234 5678901234567
             *   spans: [0, #1, 6, #2, 14, #3, 15, #4]
             * }
             * </pre>
             * <p>
             * where #1 is a reference to the {@code "print "} text node above, and so
             * on for the other text nodes.
             * </p>
             *
             * <p>
             * The {@code} spans array is an array of pairs.  Even elements are the start
             * indices of substrings, and odd elements are the text nodes (or BR elements)
             * that contain the text for those substrings.
             * Substrings continue until the next index or the end of the source.
             * </p>
             *
             * @param {Node} node an HTML DOM subtree containing source-code.
             * @return {Object} source code and the text nodes in which they occur.
             */
            function extractSourceSpans(node) {

                var chunks = [];
                var length = 0;
                var spans = [];
                var k = 0;

                var whitespace;
                if (node.currentStyle) {
                    whitespace = node.currentStyle.whiteSpace;
                } else if (window.getComputedStyle) {
                    whitespace = document.defaultView.getComputedStyle(node, null).getPropertyValue('white-space');
                }
                var isPreformatted = whitespace && 'pre' === whitespace.substring(0, 3);

                function walk(node) {
                    switch (node.nodeType) {
                        case 1:
                            // Element
                            for (var child = node.firstChild; child; child = child.nextSibling) {
                                walk(child);
                            }
                            var nodeName = node.nodeName;
                            if ('BR' === nodeName || 'LI' === nodeName) {
                                chunks[k] = '\n';
                                spans[k << 1] = length++;
                                spans[(k++ << 1) | 1] = node;
                            }
                            break;
                        case 3:
                        case 4:
                            // Text
                            var text = node.nodeValue;
                            if (text.length) {
                                if (isPreformatted) {
                                    text = text.replace(/\r\n?/g, '\n'); // Normalize newlines.
                                } else {
                                    text = text.replace(/[\r\n]+/g, '\r\n　');
                                    text = text.replace(/[ \t]+/g, ' ');
                                }
                                // TODO: handle tabs here?
                                chunks[k] = text;
                                spans[k << 1] = length;
                                length += text.length;
                                spans[(k++ << 1) | 1] = node;
                            }
                            break;
                    }
                }

                walk(node);

                return {
                    sourceCode: chunks.join('').replace(/\n$/, ''),
                    spans: spans
                };
            }

            /**
             * Breaks {@code job.sourceCode} around style boundaries in
             * {@code job.decorations} and modifies {@code job.sourceNode} in place.
             * @param {Object} job like <pre>{
             *    sourceCode: {string} source as plain text,
             *    spans: {Array.<number|Node>} alternating span start indices into source
             *       and the text node or element (e.g. {@code <BR>}) corresponding to that
             *       span.
             *    decorations: {Array.<number|string} an array of style classes preceded
             *       by the position at which they start in job.sourceCode in order
             * }</pre>
             * @private
             */
            function recombineTagsAndDecorations(sourceAndSpans, decorations) {
                //var isIE = /\bMSIE\b/.test(navigator.userAgent);
                var newlineRe = /\n/g;

                var source = sourceAndSpans.sourceCode;
                var sourceLength = source.length;
                // Index into source after the last code-unit recombined.
                var sourceIndex = 0;

                var spans = sourceAndSpans.spans;
                var nSpans = spans.length;
                // Index into spans after the last span which ends at or before sourceIndex.
                var spanIndex = 0;

                var decorations = decorations;
                var nDecorations = decorations.length;
                var decorationIndex = 0;

                var decoration = null;
                while (spanIndex < nSpans) {
                    var spanStart = spans[spanIndex];
                    var spanEnd = spans[spanIndex + 2] || sourceLength;

                    var decStart = decorations[decorationIndex];
                    var decEnd = decorations[decorationIndex + 2] || sourceLength;

                    var end = Math.min(spanEnd, decEnd);

                    var textNode = spans[spanIndex + 1];
                    var styledText;
                    if (textNode.nodeType !== 1 // Don't muck with <BR>s or <LI>s
                        // Don't introduce spans around empty text nodes.
                    &&
                    (styledText = source.substring(sourceIndex, end))) {
                        // This may seem bizarre, and it is.  Emitting LF on IE causes the
                        // code to display with spaces instead of line breaks.
                        // Emitting Windows standard issue linebreaks (CRLF) causes a blank
                        // space to appear at the beginning of every line but the first.
                        // Emitting an old Mac OS 9 line separator makes everything spiffy.
                        // if (isIE) {
                        // styledText = styledText.replace(newlineRe, '\r');
                        // }
                        textNode.nodeValue = styledText;
                        var document = textNode.ownerDocument;
                        var span = document.createElement('SPAN');
                        span.className = 'sh-' + decorations[decorationIndex + 1];
                        var parentNode = textNode.parentNode;
                        parentNode.replaceChild(span, textNode);
                        span.appendChild(textNode);
                        if (sourceIndex < spanEnd) { // Split off a text node.
                            spans[spanIndex + 1] = textNode
                            // TODO: Possibly optimize by using '' if there's no flicker.
                            =
                            document.createTextNode(source.substring(end, spanEnd));
                            parentNode.insertBefore(textNode, span.nextSibling);
                        }
                    }

                    sourceIndex = end;

                    if (sourceIndex >= spanEnd) {
                        spanIndex += 2;
                    }
                    if (sourceIndex >= decEnd) {
                        decorationIndex += 2;
                    }
                }
            }

            // Keyword lists for various languages.
            // We use things that coerce to strings to make them compact when minified
            // and to defeat aggressive optimizers that fold large string constants.
            var FLOW_CONTROL_KEYWORDS = "break continue do else for if return while";
            var C_KEYWORDS = FLOW_CONTROL_KEYWORDS + " auto case char const default double enum extern float goto int long register short signed sizeof " + "static struct switch typedef union unsigned void volatile";
            var COMMON_KEYWORDS = [C_KEYWORDS, "catch class delete false import new operator private protected public this throw true try typeof"];
            var CPP_KEYWORDS = [COMMON_KEYWORDS, "alignof align_union asm axiom bool concept concept_map const_cast constexpr decltype dynamic_cast explicit export friend inline late_check mutable namespace nullptr reinterpret_cast static_assert static_cast template typeid typename using virtual where"];
            var JAVA_KEYWORDS = [COMMON_KEYWORDS, "abstract boolean byte extends final finally implements import instanceof null native package strictfp super synchronized throws transient"];
            var CSHARP_KEYWORDS = [JAVA_KEYWORDS, "as base by checked decimal delegate descending dynamic event fixed foreach from group implicit in interface internal into is lock object out override orderby params partial readonly ref sbyte sealed stackalloc string select uint ulong unchecked unsafe ushort var"];
            var JSCRIPT_KEYWORDS = [COMMON_KEYWORDS, "debugger eval export function get null set undefined var with Infinity NaN"];
            var PERL_KEYWORDS = "caller delete die do dump elsif eval exit foreach for goto if import last local my next no our print package redo require sub undef unless until use wantarray while BEGIN END";
            var PYTHON_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "and as assert class def del elif except exec finally from global import in is lambda nonlocal not or pass print raise try with yield False True None"];
            var RUBY_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "alias and begin case class def defined elsif end ensure false in module next nil not or redo rescue retry self super then true undef unless until when yield BEGIN END"];
            var SH_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "case done elif esac eval fi function in local set then until"];
            var ALL_KEYWORDS = [CPP_KEYWORDS, CSHARP_KEYWORDS, JSCRIPT_KEYWORDS, PERL_KEYWORDS + PYTHON_KEYWORDS, RUBY_KEYWORDS, SH_KEYWORDS];
            var C_TYPES = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)/;

            /**
             * A set of tokens that can precede a regular expression literal in
             * javascript
             * http://web.archive.org/web/20070717142515/http://www.mozilla.org/js/language/js20/rationale/syntax.html
             * has the full list, but I've removed ones that might be problematic when
             * seen in languages that don't support regular expression literals.
             *
             * <p>Specifically, I've removed any keywords that can't precede a regexp
             * literal in a syntactically legal javascript program, and I've removed the
             * "in" keyword since it's not a keyword in many languages, and might be used
             * as a count of inches.
             *
             * <p>The link a above does not accurately describe EcmaScript rules since
             * it fails to distinguish between (a=++/b/i) and (a++/b/i) but it works
             * very well in practice.
             *
             * @private
             * @const
             */
            var REGEXP_PRECEDER_PATTERN = '(?:^^\\.?|[+-]|\\!|\\!=|\\!==|\\#|\\%|\\%=|&|&&|&&=|&=|\\(|\\*|\\*=|\\+=|\\,|\\-=|\\->|\\/|\\/=|:|::|\\;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\@|\\[|\\^|\\^=|\\^\\^|\\^\\^=|\\{|\\||\\|=|\\|\\||\\|\\|=|\\~|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*';
            // token style names.  correspond to css classes
            /**
             * token style for a string literal
             * @const
             */
            var STRING = 'string';
            /**
             * token style for a keyword
             * @const
             */
            var KEYWORD = 'keyword';
            /**
             * token style for a comment
             * @const
             */
            var COMMENT = 'comment';
            /**
             * token style for a type
             * @const
             */
            var TYPE = 'type';
            /**
             * token style for a literal value.  e.g. 1, null, true.
             * @const
             */
            var LITERAL = 'literal';
            /**
             * token style for a punctuation string.
             * @const
             */
            var PUNCTUATION = 'punctuation';
            /**
             * token style for a punctuation string.
             * @const
             */
            var PLAIN = 'plain';

            /**
             * token style for an sgml tag.
             * @const
             */
            var TAG = 'tag';
            /**
             * token style for a markup declaration such as a DOCTYPE.
             * @const
             */
            var DECLARATION = 'declaration';
            /**
             * token style for embedded source.
             * @const
             */
            var SOURCE = 'source';
            /**
             * token style for an sgml attribute name.
             * @const
             */
            var ATTRIB_NAME = 'attrname';
            /**
             * token style for an sgml attribute value.
             * @const
             */
            var ATTRIB_VALUE = 'attrvalue';

            var register = SH.register;

            /** returns a function that produces a list of decorations from source text.
             *
             * This code treats ", ', and ` as string delimiters, and \ as a string
             * escape.  It does not recognize perl's qq() style strings.
             * It has no special handling for double delimiter escapes as in basic, or
             * the tripled delimiters used in python, but should work on those regardless
             * although in those cases a single string literal may be broken up into
             * multiple adjacent string literals.
             *
             * It recognizes C, C++, and shell style comments.
             *
             * @param {Object} options a set of optional parameters.
             * @return {function (Object)} a function that examines the source code
             *     in the input job and builds the decoration list.
             */
            var simpleLexer = SH.simpleLexer = function (options) {

                var shortcutStylePatterns = [], fallthroughStylePatterns = [];
                if (options.tripleQuotedStrings) {
                    // '''multi-line-string''', 'single-line-string', and double-quoted
                    shortcutStylePatterns.push(['string', /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/, '\'"']);
                } else if (options.multiLineStrings) {
                    // 'multi-line-string', "multi-line-string"
                    shortcutStylePatterns.push(['string', /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/, '\'"`']);
                } else {
                    // 'single-line-string', "single-line-string"
                    shortcutStylePatterns.push(['string', /^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/, '"\'']);
                }
                if (options.verbatimStrings) {
                    // verbatim-string-literal production from the C# grammar.  See issue 93.
                    fallthroughStylePatterns.push(['string', /^@\"(?:[^\"]|\"\")*(?:\"|$)/]);
                }
                var hc = options.hashComments;
                if (hc) {
                    if (options.cStyleComments) {
                        if (hc > 1) {  // multiline hash comments
                            shortcutStylePatterns.push(['comment', /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, '#']);
                        } else {
                            // Stop C preprocessor declarations at an unclosed open comment
                            shortcutStylePatterns.push(['comment', /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/, '#']);
                        }
                        fallthroughStylePatterns.push(['string', /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/]);
                    } else {
                        shortcutStylePatterns.push(['comment', /^#[^\r\n]*/, '#']);
                    }
                }
                if (options.cStyleComments) {
                    fallthroughStylePatterns.push(['comment', /^\/\/[^\r\n]*/]);
                    fallthroughStylePatterns.push(['comment', /^\/\*[\s\S]*?(?:\*\/|$)/]);
                }
                if (options.regexLiterals) {
                    fallthroughStylePatterns.push(['regex', new RegExp('^' + REGEXP_PRECEDER_PATTERN + '(' + // A regular expression literal starts with a slash that is
                    // not followed by * or / so that it is not confused with
                    // comments.
                    '/(?=[^/*])'
                    // and then contains any number of raw characters,
                    +
                    '(?:[^/\\x5B\\x5C]'
                    // escape sequences (\x5C),
                    +
                    '|\\x5C[\\s\\S]'
                    // or non-nesting character sets (\x5B\x5D);
                    +
                    '|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+'
                    // finally closed by a /.
                    +
                    '/' + ')')]);
                }

                var types = options.types;
                if (types) {
                    fallthroughStylePatterns.push(['type', types]);
                }

                var keywords = ("" + options.keywords).replace(/^ | $/g, '');
                if (keywords.length) {
                    fallthroughStylePatterns.push(['keyword', new RegExp('^(?:' + keywords.replace(/[\s,]+/g, '|') + ')\\b')]);
                }

                shortcutStylePatterns.push(['plain', /^\s+/, ' \r\n\t\xA0']);
                fallthroughStylePatterns.push(
                // TODO(mikesamuel): recognize non-latin letters and numerals in idents
                ['literal', /^@[a-z_$][a-z_$@0-9]*/i],
                ['type', /^(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\w+_t\b)/],
                ['plain', /^[a-z_$][a-z_$@0-9]*/i],
                ['literal', new RegExp(
                     '^(?:'
                     // A hex number
                     + '0x[a-f0-9]+'
                     // or an octal or decimal number,
                     + '|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
                     // possibly in scientific notation
                     + '(?:e[+\\-]?\\d+)?'
                     + ')'
                     // with an optional modifier like UL for unsigned long
                     + '[a-z]*', 'i'), '0123456789'],
                // Don't treat escaped quotes in bash as starting strings.  See issue 144.
                ['plain', /^\\[\s\S]?/],
                ['punctuation', /^.[^\s\w\.$@\'\"\`\/\#\\]*/]);

                return shortcutStylePatterns.concat(fallthroughStylePatterns);





            }

            register('default', simpleLexer({
                'keywords': ALL_KEYWORDS,
                'hashComments': true,
                'cStyleComments': true,
                'multiLineStrings': true,
                'regexLiterals': true
            }));
            register('regex', [
                [STRING, /^[\s\S]+/]
            ]);
            register('js', simpleLexer({
                'keywords': JSCRIPT_KEYWORDS,
                'cStyleComments': true,
                'regexLiterals': true
            }));
            register('in.tag',
            [
                [PLAIN, /^[\s]+/, ' \t\r\n'],
                [ATTRIB_VALUE, /^(?:\"[^\"]*\"?|\'[^\']*\'?)/, '\"\''],
                [TAG, /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],
                [ATTRIB_NAME, /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],
                ['uq.val', /^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],
                [PUNCTUATION, /^[=<>\/]+/],
                ['js', /^on\w+\s*=\s*\"([^\"]+)\"/i],
                ['js', /^on\w+\s*=\s*\'([^\']+)\'/i],
                ['js', /^on\w+\s*=\s*([^\"\'>\s]+)/i],
                ['css', /^style\s*=\s*\"([^\"]+)\"/i],
                ['css', /^style\s*=\s*\'([^\']+)\'/i],
                ['css', /^style\s*=\s*([^\"\'>\s]+)/i]
            ]);

            register('htm html mxml xhtml xml xsl', [
                ['plain', /^[^<?]+/],
                ['declaration', /^<!\w[^>]*(?:>|$)/],
                ['comment', /^<\!--[\s\S]*?(?:-\->|$)/],
                // Unescaped content in an unknown language
                ['in.php', /^<\?([\s\S]+?)(?:\?>|$)/],
                ['in.asp', /^<%([\s\S]+?)(?:%>|$)/],
                ['punctuation', /^(?:<[%?]|[%?]>)/],
                ['plain', /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
                // Unescaped content in javascript.  (Or possibly vbscript).
                ['js', /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
                // Contains unescaped stylesheet content
                ['css', /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
                ['in.tag', /^(<\/?[a-z][^<>]*>)/i]
            ]);

            register('json', simpleLexer({
                'keywords': 'null,true,false'
            }));

            return SH;
        })(),

        /**DOM辅助处理模块*/
        Dom: {

            /**
             * 指示当前是否为 IE6-8 浏览器。
             */
            isIE: !+"\v1",

            /**
             * 遍历指定的标签名并执行指定函数。仅对 class=demo 的元素有效。
             */
            iterate: function (tagName, fn) {
                var domlist = document.getElementsByTagName(tagName), r = [], i, t;
                for (i = 0; t = domlist[i]; i++) {
                    if (t.className.indexOf('demo') >= 0) {
                        r.push(t);
                    }
                }

                for (i = 0; i < r.length; i++) {
                    fn(r[i]);
                }
            },

            /**
             * 设置 DOM ready 后的回调。
             */
            ready: function (callback) {

                function check() {
                    /in/.test(document.readyState) ? setTimeout(check, 1) : callback();
                }

                check();
            }
        },

        /**系统模块*/
        System: {

            /**
             * 预处理页面。
             */
            init: function () {

                // 令 IE 支持显示 HTML5 新元素。
                if (Demo.Dom.isIE) {
                    'article section header footer nav aside details summary menu'.replace(/\w+/g, function (tagName) {
                        document.createElement(tagName);
                    });
                }

                // 处理当前文件的属性。
                if (!Demo.web) {

                    var configs = Demo.Configs;

                    // 开发模式。
                    configs.dev = 'dev' in configs ? configs.dev : location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file';

                    // 跟目录。
                    var node = document.getElementsByTagName("script");
                    node = node[node.length - 1];
                    node = (!Demo.Dom.isIE || typeof document.constructor === 'object') ? node.src : node.getAttribute('src', 5);
                    node = node.substr(0, node.length - configs.demoFilePath.length);
                    configs.rootUrl = node;

                    var path = location.href.substr(Demo.Configs.rootUrl.length);
                    var i = path.indexOf('/');
                    configs.basePath = path.substr(0, i);
                    configs.pathInfo = path.substr(i + 1);

                    if (configs.basePath === configs.examples) {
                        configs.demo = configs.basePath;
                    }

                    configs.serverRootUrl = 'http://' + configs.host + ':' + configs.port + '/';

                    node = document.getElementsByTagName("meta");
                    for (var i = 0; node[i]; i++) {
                        if (node[i].name === configs.metaDplInfo) {
                            node = node[i].content;
                            Demo.Configs.dplInfo = Demo.parseDplInfo(node);
                            break;
                        }
                    }

                    if (!configs.dplInfo) {
                        configs.dplInfo = {};
                    }

                    if (!(configs.dplInfo.status in Demo.Configs.status)) {
                        configs.dplInfo.status = 'ok';
                    }

                    if (!('name' in configs.dplInfo)) {
                        configs.dplInfo.name = document.title;
                    }

                    if (configs.basePath === configs.demo && !/^index\./.test(configs.pathInfo)) {
                        configs.dplInfo.path = Demo.toDplPath(configs.pathInfo);

                        Demo.System.addDplHistory(configs.dplInfo.path);
                    }

                    Demo.writeHeader();

                }

                Demo.Dom.ready(Demo.System.onReady);
            },

            /**
             * 在 Dom Ready 之后的回调函数。
             */
            onReady: function () {

                // 处理 script.demo 。
                // script.demo[type=text/html] => aside.demo
                // script.demo[type=text/javascript] => 插入 pre.demo
                // script.demo[type=code/html] => pre.demo
                // script.demo[type=code/javascript] => pre.demo
                Demo.Dom.iterate('SCRIPT', function (node) {
                	var value = node.innerHTML.replace(/<(\/?)\\script/g, "<$1script");
                    switch (node.type) {
                        case '':
                        case 'text/javascript':
                            insertCode(node, node.innerHTML, 'js', true);
                            break;
                        case 'text/html':
                            var code = document.createElement('ASIDE');
                            code.className = node.className;
                            node.parentNode.replaceChild(code, node);
                            code.$code = value;

                            if (Demo.Dom.isIE) {
                                code.innerHTML = '$' + value;
                                code.removeChild(code.firstChild);
                            } else {
                                code.innerHTML = value;
                            }
                            
                            // 模拟执行全部脚本。
                            var scripts = code.getElementsByTagName('SCRIPT');
                            for (var i = 0; scripts[i]; i++) {
                                if (window.execScript) {
                                    window.execScript(scripts[i].innerHTML);
                                } else {
                                    window.eval(scripts[i].innerHTML);
                                }
                            }
                            break;
                        case 'code/javascript':
                            insertCode(node, value, 'js');
                            break;
                        default:
                            if (/^code\//.test(node.type)) {
                                insertCode(node, value, node.type.substr(5));
                            } else {
                                insertCode(node, value, 'text');
                            }

                            break;
                    }
                });

                // 处理 aside.demo 。
                Demo.Dom.iterate('ASIDE', function (node) {
                    insertCode(node, node.$code || node.innerHTML, 'html', true);
                });

				setTimeout(function(){
                	Demo.Dom.iterate('PRE', Demo.SyntaxHighligher.one);
				}, 0);

                function insertCode(node, value, language, canHide) {

                    var pre = document.createElement('pre'),
                        formatType = language === 'html' ? 1 : language === 'js' ? 2 : 0;
                    pre.className = 'demo sh sh-' + language + (canHide ? ' demo-sourcecode' : '');

                    if (node.className.indexOf('demo-noformat') >= 0 || !formatType) {
                        value = value.replace(/^[\r\n]+/, "").replace(/\s+$/, "");
                        var space = /^\s+/.exec(value);

                        if (space) {
                            space = space[0];
                            value = value.split(/[\r\n]/);
                            for (var i = value.length - 1; i >= 0; i--) {
                                value[i] = value[i].replace(space, "");
                            }
                            value = value.join('\r\n');
                        }
                    } else {
                        value = formatType === 1 ? Demo.Text.formatHTML(value) : Demo.Text.formatJS(value);
                    }

                    pre.textContent = pre.innerText = value;

                    pre.innerHTML = pre.innerHTML.replace(/##([\s\S]*?)##/g, "<strong>$1</strong>").replace(/__([\s\S]*?)__/g, "<u>$1</u>");

                    node.parentNode.insertBefore(pre, node.nextSibling);
                }
            },

            /**
             * 切换折叠或展开全部源码。
             */
            toggleSources: function (value) {

                Demo.System.sourceDisplay = Demo.System.sourceDisplay === 'none' ? '' : 'none';

                Demo.Dom.iterate('PRE', function (node) {
                    if (node.className.indexOf('demo-sourcecode') >= 0) {
                        node.style.display = Demo.System.sourceDisplay;
                    }
                });

            },

            initDropDown: function (id) {
                var dropDown = document.createElement('div');
                dropDown.id = id;
                document.getElementById('demo-toolbar').appendChild(dropDown);
                switch (id) {
                    case "demo-toolbar-tool":
                        simpleDropDown('tool', '74px');
                        break;
                    case "demo-toolbar-doc":
                        simpleDropDown('doc', '100px');
                        break;
                    case "demo-toolbar-goto":
                        dropDown.className = 'demo-toolbar-dropdown';
                        dropDown.style.width = '300px';
                        dropDown.innerHTML = '<input style="width:290px;padding:5px;border:0;border-bottom:1px solid #9B9B9B;" type="text" onfocus="this.select()" placeholder="输入组件名..."><div class="demo-toolbar-dropdown-menu" style="_height: 300px;_width:300px;word-break:break-all;max-height:300px;overflow:auto;"></div>';
                        dropDown.defaultButton = dropDown.firstChild;
                        dropDown.defaultButton.onkeydown = function (e) {
                            e = e || window.event;
                            var keyCode = e.keyCode;
                            if (keyCode == 40 || keyCode == 38) {
                                Demo.System.gotoMoveListHover(keyCode == 40);

                            }
                        };

                        dropDown.defaultButton.onkeypress = function (e) {
                            e = e || window.event;
                            var keyCode = e.keyCode;
                            if (keyCode == 13 || keyCode == 10) {
                                var link = Demo.System.gotoGetCurrent();

                                if (link) {
                                    location.href = link.href;
                                }

                            }
                        };

                        dropDown.defaultButton.onkeyup = function (e) {
                            e = e || window.event;
                            var keyCode = e.keyCode;
                            if (keyCode !== 40 && keyCode !== 38 && keyCode != 13 && keyCode != 10) {
                                Demo.System.gotoUpdateList();
                            }
                        };

                        Demo.System.loadDplList(Demo.System.gotoUpdateList);

                        break;
                    case "demo-toolbar-controlstate":
                        var dplInfo = Demo.Configs.dplInfo;
                        var n = Demo.splitPath(dplInfo.path);
                        dropDown.className = 'demo-toolbar-dropdown';
                        dropDown.style.cssText = 'padding:5px;*width:260px;';
                        var html = '<style>#demo-toolbar-controlstate input{vertical-align: -2px;}</style><form style="*margin-bottom:0" action="' + Demo.Configs.serverRootUrl + Demo.Configs.apiPath + 'dplmanager.njs" method="get">\
                    <fieldset>\
                        <legend>进度</legend>';

                        var i = 1, key;
                        for (key in Demo.Configs.status) {
                            html += '<input name="status" type="radio"' + (dplInfo.status === key ? ' checked="checked"' : '') + ' id="demo-controlstate-status-' + key + '" value="' + key + '"><label for="demo-controlstate-status-' + key + '">' + Demo.Configs.status[key] + '</label>';

                            if (i++ === 3) {
                                html += '<br>';
                            }
                        }

                        html += '</fieldset>\
                    <fieldset>\
                        <legend>兼容</legend>';

                        i = 1;
                        var support = dplInfo.support ? dplInfo.support.split('|') : Demo.Configs.support;

                        for (i = 0; i < Demo.Configs.support.length; i++) {
                            key = Demo.Configs.support[i];
                            html += '<input name="support" type="checkbox"' + (Demo.indexOf(support, key) >= 0 ? ' checked="checked"' : '') + ' id="demo-controlstate-support-' + key + '" value="' + key + '"><label for="demo-controlstate-support-' + key + '">' + Demo.Configs.support[i] + '</label>';

                            if (i === 5) {
                                html += '<br>';
                            }
                        }

                        html += '</fieldset>\
                    <fieldset>\
                        <legend>标题</legend>\
                    <input style="width:224px" type="text" name="title" value="' + dplInfo.name + '">\
                </fieldset>\
\
                <input value="保存修改" class="demo-right" type="submit">\
                <a href="javascript://彻底删除当前组件及相关源码" onclick="if(prompt(\'确定删除当前组件吗?  如果确认请输入 yes\') === \'yes\')location.href=\'' + Demo.Configs.serverRootUrl + Demo.Configs.apiPath + 'dplmanager.njs?action=delete&module=' + n.module + '&category=' + n.category + '&name=' + n.name + '&postback=' + encodeURIComponent(Demo.Configs.rootUrl + Demo.Configs.demo + '/index.html') + '\'">删除组件</a>\
<input type="hidden" name="module" value="' + n.module + '">\
<input type="hidden" name="category" value="' + n.category + '">\
<input type="hidden" name="name" value="' + n.name + '">\
<input type="hidden" name="action" value="update">\
<input type="hidden" name="postback" value="' + location.href + '">\
            </form>';
                        dropDown.innerHTML = html;
                        break;
                }

                function simpleDropDown(id, right) {
                    dropDown.style.right = right;
                    dropDown.className = 'demo-toolbar-dropdown demo-toolbar-dropdown-menu demo-toolbar-dropdown-menu-usehover';
                    dropDown.innerHTML = Demo.Configs[id].replace(/~\//g, Demo.Configs.rootUrl).replace('{serverRootUrl}', Demo.Configs.serverRootUrl).replace('{pathname}', (location.pathname || "").replace(/^\//, ""));
                    dropDown.onclick = function () {
                        dropDown.style.display = 'none';
                    };
                }

                return dropDown;
            },

            showDropDown: function (id, delay) {

                Demo.System.cleanDropDownTimer();

                Demo.System.dropDownTimerShow = setTimeout(function () {

                    // 删除延时状态。
                    Demo.System.dropDownTimerShow = 0;

                    // 如果已经显示了一个菜单，则关闭之。
                    if (Demo.System.dropDownShown) {
                        Demo.System.dropDownShown.style.display = 'none';
                    }

                    var dropDown = document.getElementById(id);

                    if (!dropDown) {
                        dropDown = Demo.System.initDropDown(id);
                    }

                    // 如果移到了菜单上，则停止关闭菜单的计时器。
                    dropDown.onmouseover = function () {
                        if (Demo.System.dropDownTimerHide) {
                            clearTimeout(Demo.System.dropDownTimerHide);
                            Demo.System.dropDownTimerHide = 0;
                        }
                    };

                    dropDown.onmouseout = Demo.System.hideDropDown;

                    dropDown.style.display = '';

                    if (dropDown.defaultButton) {
                        dropDown.defaultButton.focus();
                    }
                    Demo.System.dropDownShown = dropDown;
                }, delay || 200);

            },

            cleanDropDownTimer: function () {

                // 如果正在隐藏，则忽略之。
                if (Demo.System.dropDownTimerHide) {
                    clearTimeout(Demo.System.dropDownTimerHide);
                    Demo.System.dropDownTimerHide = 0;
                }

                // 如果正在显示，则忽略之。
                if (Demo.System.dropDownTimerShow) {
                    clearTimeout(Demo.System.dropDownTimerShow);
                    Demo.System.dropDownTimerShow = 0;
                }
            },

            hideDropDown: function () {

                Demo.System.cleanDropDownTimer();

                if (Demo.System.dropDownShown) {
                    Demo.System.dropDownTimerHide = setTimeout(function () {
                        Demo.System.dropDownShown.style.display = 'none';
                        Demo.System.dropDownShown = null;
                    }, 400);
                }
            },

            addDplHistory: function (dpl) {
                if (window.localStorage) {
                    var dplList = localStorage.demoDplHistory;
                    dplList = dplList ? dplList.split(';') : [];

                    for (var i = 0; i < dplList.length; i++) {
                        if (dplList[i] === dpl) {
                            dplList.splice(i, 1);
                            break;
                        }
                    }

                    if (dplList.length > Demo.Configs.maxHistory) {
                        dplList.shift();
                    }

                    dplList.push(dpl);
                    localStorage.demoDplHistory = dplList.join(';');
                }
            },

            /**
             * 载入 DPL 列表。
             */
            loadDplList: function (callback) {

                if (window.DplList) {
                    callback(window.DplList);
                    return;
                }

                var script = document.createElement('SCRIPT');
                script.onload = script.onreadystatechange = function () {
                    if (!script.readyState || !/in/.test(script.readyState)) {
                        script.onload = script.onreadystatechange = null;

                        callback(window.DplList);
                    }
                };

                script.type = 'text/javascript';
                script.src = Demo.Configs.rootUrl + Demo.Configs.dplListFilePath;

                var head = document.getElementsByTagName('HEAD')[0];
                head.insertBefore(script, head.firstChild);
            },

            gotoUpdateList: function () {

                if (!window.DplList) {
                    return;
                }

                var dropDown = document.getElementById('demo-toolbar-goto'),
                    filter = dropDown.defaultButton.value.toLowerCase(),
                    pathLower,
                    html = '',
                    html2 = '',
                    histories,
                    sep = false;

                if (filter) {
                    filter = filter.replace(/^\s+|\s+$/g, "");
                    for (var path in DplList) {
                        pathLower = path.toLowerCase();
                        if (pathLower.indexOf('.' + filter) >= 0) {
                            html += getTpl(path);
                        } else if (pathLower.indexOf(filter) >= 0 || DplList[path].name.toLowerCase().indexOf(filter) >= 0) {
                            html2 += getTpl(path);
                        }
                    }
                } else {

                    if (histories = window.localStorage && localStorage.demoDplHistory) {
                        histories = histories.split(';');
                        for (var i = histories.length - 1; i >= 0; i--) {
                            if (histories[i] in DplList) {
                                html += getTpl(histories[i]);
                            }
                        }

                        sep = !!html;
                    }

                    for (var path in DplList) {
                        html2 += getTpl(path);
                    }
                }

                function getTpl(path) {
                    var tpl = '';
                    if (sep) {
                        tpl = ' style="border-top: 1px solid #EBEBEB"';
                        sep = false;
                    }
                    return '<a' + tpl + ' onmouseover="Demo.System.gotoSetListHover(this)" href="' + Demo.getDemoUrl(path) + '">' + path + '<small style="color: #999"> - ' + DplList[path].name + '</small></a>';
                }

                dropDown.lastChild.innerHTML = html + html2;

                if (dropDown.lastChild.firstChild) {
                    dropDown.lastChild.firstChild.className = 'demo-toolbar-dropdown-menu-hover';
                }

            },

            gotoMoveListHover: function (goDown) {
                var currentNode = Demo.System.gotoGetCurrent();

                if (currentNode) {
                    currentNode.className = '';
                }

                if (!currentNode || !currentNode[goDown ? 'nextSibling' : 'previousSibling']) {
                    currentNode = document.getElementById('demo-toolbar-goto').lastChild[goDown ? 'firstChild' : 'lastChild'];
                } else {
                    currentNode = currentNode[goDown ? 'nextSibling' : 'previousSibling'];
                }

                if (currentNode)
                    currentNode.className = 'demo-toolbar-dropdown-menu-hover';
            },

            gotoSetListHover: function (newHover) {
                var current = Demo.System.gotoGetCurrent();
                if (current) {
                    current.className = '';
                }
                newHover.className = 'demo-toolbar-dropdown-menu-hover';
            },

            gotoGetCurrent: function () {
                var node = document.getElementById('demo-toolbar-goto').lastChild;
                for (node = node.firstChild; node; node = node.nextSibling) {
                    if (node.className === 'demo-toolbar-dropdown-menu-hover') {
                        return node;
                    }
                }
            }

        },

        /**
         * 向页面写入自动生成的头部信息。
         */
        writeHeader: function () {

            // 获取当前页面的配置信息。
            var configs = Demo.Configs,
                space = navigator.userAgent.indexOf('Firefox/') > 0 ? '' : ' ',
                html = '';

            // 输出 css 和 js
            document.write('<link type="text/css" rel="stylesheet" href="' + configs.rootUrl + 'assets/demo/demo.css" />');
            // document.write('<link type="text/css" rel="stylesheet" href="' + configs.rootUrl + 'assets/demo/_staticpages/assets/styles/demo.css" />');
            if (!window.console)
                document.write('<script type="text/javascript" src="' + configs.rootUrl + 'assets/demo/firebug-lite/build/firebug-lite.js"></script>');
            
            if (!configs.dev) {
                document.write('<script type="text/javascript" src="' + configs.rootUrl + 'assets/web/scripts/stat.js"></script>');
            }

            // IE 需要强制中止 <head>
            if (Demo.Dom.isIE) {
                document.write('<div class="demo-hide" id="demo-ie6-html5hack">&nbsp;</div>');
                document.body.removeChild(document.getElementById("demo-ie6-html5hack"));
            }

            // 输出 header
            html += '<header class="demo">';

            html += '<aside id="demo-toolbar"><nav class="demo-toolbar">';

            // 只有在有组件路径的时候，才显示状态。
            if (configs.dplInfo.path) {
                if (configs.dev) {
                    html += '<a href="javascript://更改组件属性" onclick="Demo.System.showDropDown(\'demo-toolbar-controlstate\', 1);return false;" onmouseout="Demo.System.hideDropDown()" title="点击修改组件状态" accesskey="S">' + configs.status[configs.dplInfo.status] + '</a> | ';
                } else {
                    html += '<a href="javascript:;">' + configs.status[configs.dplInfo.status] + '</a> | ';
                }
            }

            html += '<a href="javascript://常用文档" onclick="Demo.System.showDropDown(\'demo-toolbar-doc\', 1);return false;" onmouseover="Demo.System.showDropDown(\'demo-toolbar-doc\')" onmouseout="Demo.System.hideDropDown()" accesskey="D">文档' + space + '▾</a> | <a href="javascript://常用工具" onclick="Demo.System.showDropDown(\'demo-toolbar-tool\', 1);return false;" onmouseover="Demo.System.showDropDown(\'demo-toolbar-tool\')" onclick="Demo.System.showDropDown(\'demo-toolbar-tool\', 1);return false;" onmouseout="Demo.System.hideDropDown()" accesskey="T">工具' + space + '▾</a> | <a href="javascript://快速打开其他组件" onmouseover="Demo.System.showDropDown(\'demo-toolbar-goto\')" onclick="Demo.System.showDropDown(\'demo-toolbar-goto\', 1);return false;" onmouseout="Demo.System.hideDropDown()" accesskey="G">转到' + space + '▾</a> | ';

            if (Demo.Configs.basePath === Demo.Configs.demo && /^index\.html($|\?|#)/.test(Demo.Configs.pathInfo)) {
                html += '<a href="' + configs.serverRootUrl + configs.apiPath + 'dplmanager.njs?action=updatelist&postback=' + encodeURIComponent(location.href) + ' " title="刷新组件列表缓存" accesskey="H">刷新列表</a>';
            } else {
                html += '<a href="' + configs.rootUrl + configs.demo + '/index.html" title="返回组件列表" accesskey="H">返回列表</a>';
            }

            html += '</nav></aside>';

            // 生成标题。
            if (configs.dplInfo.name) {
                html += '<h1 class="demo">' + configs.dplInfo.name;

                var subtitle = configs.dplInfo.subtitle || configs.dplInfo.path;

                if (subtitle) {
                    html += '<small>' + subtitle + '</small>';
                }

                html += '</h1>';
            }

            html += '</header>';

            document.write(html);

        },

        /**
         * 向页面写入自动生成的底部信息。
         */
        writeFooter: function () {
        	if(Demo.dev)
            	document.write(Demo.Configs.footer.replace(/~\//g, Demo.Configs.rootUrl));
        },

        /**
         * 演示模块。
         */
        Example: {

            run: function (id) {
                var example = this.data[id],
                    ret;

                try {

                    if (example[1]) {
                        ret = example[1].call(window);
                    } else {
                        ret = window.eval(example[0]);
                    }

                } catch (e) {
                    this.reportResult(id, '[执行出现错误: ' + e.message + ']');
                    console.error(example[0], ' => ', e);
                    return;
                }

                if (ret === undefined) {
                    console.log(example[0]);
                } else {
                    console.log(example[0], " => ", ret);
                }

            },

            runAll: function () {
                var me = this,
                    i = 0,
                    len = me.data.length,
                    needEnd;

                function work() {
                    if (i < len) {
                        if (me.data[i][0] === null) {
                            needEnd = true;
                            if (i && console.groupEnd) {
                                console.groupEnd();
                            }

                            if (console.group) {
                                console.group(me.data[i][1]);
                            } else {
                                console.info(me.data[i][1]);
                            }

                            i++;
                            work();
                        } else {
                            me.run(i++);
                            setTimeout(work, 1);
                        }
                    } else if (needEnd && console.groupEnd) {
                        console.groupEnd();
                    }
                }

                work();
            },

            speedTest: function (id) {

                // Support For Trace
                if (window.trace) {
                    window.trace.enable = false;
                }

                // Support For Alert
                var _alert = window.alert;
                window.alert = function () { };

                var time,
                    currentTime,
                    start = +new Date(),
                    past,
                    func = this.data[id][1] || new Function(this.data[id][0]);

                try {

                    time = 0;

                    do {

                        time += 10;

                        currentTime = 10;
                        while (--currentTime > 0) {
                            func();
                        }

                        past = +new Date() - start;

                    } while (past < 100);

                    past = '  [' + Math.round(past / time * 1000) / 1000 + 'ms]';

                } catch (e) {
                    past = '[执行出现错误: ' + e.message + ']';
                } finally {
                    window.alert = _alert;

                    if (window.trace) {
                        window.trace.enable = true;
                    }
                }

                this.reportResult(id, past);

            },

            speedTestAll: function () {
                var me = this, i = 0, len = me.data.length;
                function work() {
                    if (i < len) {
                        if (me.data[i][0] === null) {
                            i++;
                            work();
                        } else {
                            me.speedTest(i++);
                            setTimeout(work, 1);
                        }
                    }
                }

                work();
            },

            reportResult: function (id, value) {
                id = document.getElementById('demo-example-' + id);

                if (id.lastChild.tagName !== 'SMALL') {
                    id.appendChild(document.createElement('SMALL'));
                }

                id.lastChild.innerHTML = value;
            }

        },

        /**
         * 输出示例代码。
         */
        writeExamples: function (examples, options) {

            var globalExamples = Demo.Example.data,
                html = '',
                key,
                id,
                example,
                text,
                func;

            // 如果第一次使用测试。则写入全部测试和效率。
            if (!globalExamples) {
                Demo.Example.data = globalExamples = [];
                html = '<nav class="demo demo-toolbar">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="Demo.System.toggleSources();" href="javascript://切换显示或隐藏全部源码">折叠代码</a> | <a onclick="Demo.Example.speedTestAll();" href="javascript://查看全部代码的执行效率">全部效率</a> | <a onclick="Demo.Example.runAll();" href="javascript://按顺序执行全部代码">全部执行</a></nav>';
            }

            for (key in examples) {
                id = globalExamples.length;
                example = examples[key];

                if (example === '-') {
                    text = null;
                    func = key;
                    html += '<h3 class="demo">' + Demo.Text.encodeHTML(key) + '</h3>';
                } else {

                    if (typeof example === 'function') {
                        func = example;
                        text = Demo.Text.decodeUTF8(example.toString()).replace(/^function\s*\(.*?\)\s*\{/, "").replace(/\}\s*$/, "");
                    } else {
                        text = example;
                        func = null;
                    }

                    text = Demo.Text.formatJS(text);

                    html += '<section onmouseover="this.firstChild.style.display=\'block\'" onmouseout="this.firstChild.style.display=\'none\'"><nav class="demo demo-toolbar" style="display: none"><a onclick="Demo.Example.speedTest(' + id + '); return false;" href="javascript://测试代码执行的效率">效率</a> | <a onclick="Demo.Example.run(' + id + '); return false;" href="javascript://执行函数">执行</a></nav><h4 class="demo" id="demo-example-' + id + '">' + Demo.Text.encodeHTML(key) + '</h4><pre class="demo demo-sourcecode sh-js sh">' + Demo.Text.encodeHTML(text) + '</pre></section>';

                }

                globalExamples[id] = [text, func];
            }

            document.write(html);
        }

    });


    Demo.System.init();

    /// #endregion

} else {

    // 导出 Demo 模块。
    module.exports = Demo;

}
