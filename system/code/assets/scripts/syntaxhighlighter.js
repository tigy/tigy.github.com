

 var SyntaxHighligher = (function () {
 	var SH = {

 		brushes: {},
		
 		/** Common regular expressions. */
 		regexLib: {
 			multiLineCComments: /\/\*[\s\S]*?\*\//gm,
 			singleLineCComments: /\/\/.*$/gm,
 			singleLinePerlComments: /#.*$/gm,
 			doubleQuotedString: /"([^\\"\n]|\\.)*"/g,
 			singleQuotedString: /'([^\\'\n]|\\.)*'/g,
 			multiLineDoubleQuotedString: new XRegExp('"([^\\\\"]|\\\\.)*"', 'gs'),
 			multiLineSingleQuotedString: new XRegExp("'([^\\\\']|\\\\.)*'", 'gs'),
 			xmlComments: /(&lt;|<)!--[\s\S]*?--(&gt;|>)/gm,
 			url: /\w+:\/\/[\w-.\/?%&=:@;]*/g,

 			/** <?= ?> tags. */
 			phpScriptTags: { left: /(&lt;|<)\?=?/g, right: /\?(&gt;|>)/g },

 			/** <%= %> tags. */
 			aspScriptTags: { left: /(&lt;|<)%=?/g, right: /%(&gt;|>)/g },

 			/** <script></script> tags. */
 			scriptScriptTags: { left: /(&lt;|<)\s*script.*?(&gt;|>)/gi, right: /(&lt;|<)\/\s*script\s*(&gt;|>)/gi }
		 },

 		/**
		 * Main Highlither class.
		 * @constructor
		 */
 		Brush: function () {
 			// not putting any code in here because of the prototype inheritance
 		},

 		highlight: function(sourceCode, language, options){
 			var brush = brushes[language];
 			if (brush) {
 				brush = new brush();
 				brush.init(options);
 				return brush.highlight(sourceCode);
			 }

 			return -1;
 		}

 	};



 	SH.Brush.prototype = {
 		/**
		 * Returns value of the parameter passed to the highlighter.
		 * @param {String} name				Name of the parameter.
		 * @param {Object} defaultValue		Default value.
		 * @return {Object}					Returns found value or default value otherwise.
		 */
 		getParam: function (name, defaultValue) {
 			var result = this.params[name];
 			return toBoolean(result == null ? defaultValue : result);
 		},

 		/**
		 * Shortcut to document.createElement().
		 * @param {String} name		Name of the element to create (DIV, A, etc).
		 * @return {HTMLElement}	Returns new HTML element.
		 */
 		create: function (name) {
 			return document.createElement(name);
 		},

 		/**
		 * Applies all regular expression to the code and stores all found
		 * matches in the `this.matches` array.
		 * @param {Array} regexList		List of regular expressions.
		 * @param {String} code			Source code.
		 * @return {Array}				Returns list of matches.
		 */
 		findMatches: function (regexList, code) {
 			var result = [];

 			if (regexList != null)
 				for (var i = 0; i < regexList.length; i++)
 					// BUG: length returns len+1 for array if methods added to prototype chain (oising@gmail.com)
 					if (typeof (regexList[i]) == "object")
 						result = result.concat(getMatches(code, regexList[i]));

 			// sort and remove nested the matches
 			return this.removeNestedMatches(result.sort(matchesSortCallback));
 		},

 		/**
		 * Checks to see if any of the matches are inside of other matches.
		 * This process would get rid of highligted strings inside comments,
		 * keywords inside strings and so on.
		 */
 		removeNestedMatches: function (matches) {
 			// Optimized by Jose Prado (http://joseprado.com)
 			for (var i = 0; i < matches.length; i++) {
 				if (matches[i] === null)
 					continue;

 				var itemI = matches[i],
				itemIEndPos = itemI.index + itemI.length
				;

 				for (var j = i + 1; j < matches.length && matches[i] !== null; j++) {
 					var itemJ = matches[j];

 					if (itemJ === null)
 						continue;
 					else if (itemJ.index > itemIEndPos)
 						break;
 					else if (itemJ.index == itemI.index && itemJ.length > itemI.length)
 						matches[i] = null;
 					else if (itemJ.index >= itemI.index && itemJ.index < itemIEndPos)
 						matches[j] = null;
 				}
 			}

 			return matches;
 		},

 		/**
		 * Creates an array containing integer line numbers starting from the 'first-line' param.
		 * @return {Array} Returns array of integers.
		 */
 		figureOutLineNumbers: function (code) {
 			var lines = [],
			firstLine = parseInt(this.getParam('first-line'))
			;

 			eachLine(code, function (line, index) {
 				lines.push(index + firstLine);
 			});

 			return lines;
 		},

 		/**
		 * Determines if specified line number is in the highlighted list.
		 */
 		isLineHighlighted: function (lineNumber) {
 			var list = this.getParam('highlight', []);

 			if (typeof (list) != 'object' && list.push == null)
 				list = [list];

 			return indexOf(list, lineNumber.toString()) != -1;
 		},

 		/**
		 * Generates HTML markup for a single line of code while determining alternating line style.
		 * @param {Integer} lineNumber	Line number.
		 * @param {String} code Line	HTML markup.
		 * @return {String}				Returns HTML markup.
		 */
 		getLineHtml: function (lineIndex, lineNumber, code) {
 			var classes = [
			'line',
			'number' + lineNumber,
			'index' + lineIndex,
			'alt' + (lineNumber % 2 == 0 ? 1 : 2).toString()
 			];

 			if (this.isLineHighlighted(lineNumber))
 				classes.push('highlighted');

 			if (lineNumber == 0)
 				classes.push('break');

 			return '<div class="' + classes.join(' ') + '">' + code + '</div>';
 		},

 		/**
		 * Generates HTML markup for line number column.
		 * @param {String} code			Complete code HTML markup.
		 * @param {Array} lineNumbers	Calculated line numbers.
		 * @return {String}				Returns HTML markup.
		 */
 		getLineNumbersHtml: function (code, lineNumbers) {
 			var html = '',
			count = splitLines(code).length,
			firstLine = parseInt(this.getParam('first-line')),
			pad = this.getParam('pad-line-numbers')
			;

 			if (pad == true)
 				pad = (firstLine + count - 1).toString().length;
 			else if (isNaN(pad) == true)
 				pad = 0;

 			for (var i = 0; i < count; i++) {
 				var lineNumber = lineNumbers ? lineNumbers[i] : firstLine + i,
				code = lineNumber == 0 ? sh.config.space : padNumber(lineNumber, pad)
				;

 				html += this.getLineHtml(i, lineNumber, code);
 			}

 			return html;
 		},

 		/**
		 * Splits block of text into individual DIV lines.
		 * @param {String} code			Code to highlight.
		 * @param {Array} lineNumbers	Calculated line numbers.
		 * @return {String}				Returns highlighted code in HTML form.
		 */
 		getCodeLinesHtml: function (html, lineNumbers) {
 			html = trim(html);

 			var lines = splitLines(html),
			padLength = this.getParam('pad-line-numbers'),
			firstLine = parseInt(this.getParam('first-line')),
			html = '',
			brushName = this.getParam('brush')
			;

 			for (var i = 0; i < lines.length; i++) {
 				var line = lines[i],
				indent = /^(&nbsp;|\s)+/.exec(line),
				spaces = null,
				lineNumber = lineNumbers ? lineNumbers[i] : firstLine + i;
				;

 				if (indent != null) {
 					spaces = indent[0].toString();
 					line = line.substr(spaces.length);
 					spaces = spaces.replace(' ', sh.config.space);
 				}

 				line = trim(line);

 				if (line.length == 0)
 					line = sh.config.space;

 				html += this.getLineHtml(
				i,
				lineNumber,
				(spaces != null ? '<code class="' + brushName + ' spaces">' + spaces + '</code>' : '') + line
			);
 			}

 			return html;
 		},

 		/**
		 * Returns HTML for the table title or empty string if title is null.
		 */
 		getTitleHtml: function (title) {
 			return title ? '<caption>' + title + '</caption>' : '';
 		},

 		/**
		 * Finds all matches in the source code.
		 * @param {String} code		Source code to process matches in.
		 * @param {Array} matches	Discovered regex matches.
		 * @return {String} Returns formatted HTML with processed mathes.
		 */
 		getMatchesHtml: function (code, matches) {
 			var pos = 0,
			result = '',
			brushName = this.getParam('brush', '')
			;

 			function getBrushNameCss(match) {
 				var result = match ? (match.brushName || brushName) : brushName;
 				return result ? result + ' ' : '';
 			};

 			// Finally, go through the final list of matches and pull the all
 			// together adding everything in between that isn't a match.
 			for (var i = 0; i < matches.length; i++) {
 				var match = matches[i],
				matchBrushName
				;

 				if (match === null || match.length === 0)
 					continue;

 				matchBrushName = getBrushNameCss(match);

 				result += wrapLinesWithCode(code.substr(pos, match.index - pos), matchBrushName + 'plain')
					+ wrapLinesWithCode(match.value, matchBrushName + match.css)
					;

 				pos = match.index + match.length + (match.offset || 0);
 			}

 			// don't forget to add whatever's remaining in the string
 			result += wrapLinesWithCode(code.substr(pos), getBrushNameCss() + 'plain');

 			return result;
 		},

 		/**
		 * Generates HTML markup for the whole syntax highlighter.
		 * @param {String} code Source code.
		 * @return {String} Returns HTML markup.
		 */
 		getHtml: function (code) {
 			var html = '',
			classes = ['syntaxhighlighter'],
			tabSize,
			matches,
			lineNumbers
			;

 			// process light mode
 			if (this.getParam('light') == true)
 				this.params.toolbar = this.params.gutter = false;

 			className = 'syntaxhighlighter';

 			if (this.getParam('collapse') == true)
 				classes.push('collapsed');

 			if ((gutter = this.getParam('gutter')) == false)
 				classes.push('nogutter');

 			// add custom user style name
 			classes.push(this.getParam('class-name'));

 			// add brush alias to the class name for custom CSS
 			classes.push(this.getParam('brush'));

 			code = trimFirstAndLastLines(code)
			.replace(/\r/g, ' ') // IE lets these buggers through
			;

 			tabSize = this.getParam('tab-size');

 			// replace tabs with spaces
 			code = this.getParam('smart-tabs') == true
			? processSmartTabs(code, tabSize)
			: processTabs(code, tabSize)
			;

 			// unindent code by the common indentation
 			code = unindent(code);

 			if (gutter)
 				lineNumbers = this.figureOutLineNumbers(code);

 			// find matches in the code using brushes regex list
 			matches = this.findMatches(this.regexList, code);
 			// processes found matches into the html
 			html = this.getMatchesHtml(code, matches);
 			// finally, split all lines so that they wrap well
 			html = this.getCodeLinesHtml(html, lineNumbers);

 			// finally, process the links
 			if (this.getParam('auto-links'))
 				html = processUrls(html);

 			if (typeof (navigator) != 'undefined' && navigator.userAgent && navigator.userAgent.match(/MSIE/))
 				classes.push('ie');

 			html =
			'<div id="' + getHighlighterId(this.id) + '" class="' + classes.join(' ') + '">'
				+ (this.getParam('toolbar') ? sh.toolbar.getHtml(this) : '')
				+ '<table border="0" cellpadding="0" cellspacing="0">'
					+ this.getTitleHtml(this.getParam('title'))
					+ '<tbody>'
						+ '<tr>'
							+ (gutter ? '<td class="gutter">' + this.getLineNumbersHtml(code) + '</td>' : '')
							+ '<td class="code">'
								+ '<div class="container">'
									+ html
								+ '</div>'
							+ '</td>'
						+ '</tr>'
					+ '</tbody>'
				+ '</table>'
			+ '</div>'
			;

 			return html;
 		},

 		tabSize: 4,

		smartTabs: true,

 		highlight: function(sourceCode){
 			var html = '',
			tabSize = this.tabSize,
			matches,
			lineNumbers
			;

 			sourceCode = trimFirstAndLastLines(sourceCode).replace(/\r/g, ' '); // IE lets these buggers through

 			// replace tabs with spaces
 			code = this.smartTabs
			? processSmartTabs(code, tabSize)
			: processTabs(code, tabSize)
			;

 			// unindent code by the common indentation
 			code = unindent(code);

 			if (gutter)
 				lineNumbers = this.figureOutLineNumbers(code);

 			// find matches in the code using brushes regex list
 			matches = this.findMatches(this.regexList, code);
 			// processes found matches into the html
 			html = this.getMatchesHtml(code, matches);
 			// finally, split all lines so that they wrap well
 			html = this.getCodeLinesHtml(html, lineNumbers);

 			// finally, process the links
 			if (this.getParam('auto-links'))
 				html = processUrls(html);

 			if (typeof (navigator) != 'undefined' && navigator.userAgent && navigator.userAgent.match(/MSIE/))
 				classes.push('ie');

 			html =
			'<div id="' + getHighlighterId(this.id) + '" class="' + classes.join(' ') + '">'
				+ (this.getParam('toolbar') ? sh.toolbar.getHtml(this) : '')
				+ '<table border="0" cellpadding="0" cellspacing="0">'
					+ this.getTitleHtml(this.getParam('title'))
					+ '<tbody>'
						+ '<tr>'
							+ (gutter ? '<td class="gutter">' + this.getLineNumbersHtml(code) + '</td>' : '')
							+ '<td class="code">'
								+ '<div class="container">'
									+ html
								+ '</div>'
							+ '</td>'
						+ '</tr>'
					+ '</tbody>'
				+ '</table>'
			+ '</div>'
			;

 			return html;
 		},

 		/**
		 * Highlights the code and returns complete HTML.
		 * @param {String} code     Code to highlight.
		 * @return {Element}        Returns container DIV element with all markup.
		 */
 		getDiv: function (code) {
 			if (code === null)
 				code = '';

 			this.code = code;

 			var div = this.create('div');

 			// create main HTML
 			div.innerHTML = this.getHtml(code);

 			// set up click handlers
 			if (this.getParam('toolbar'))
 				attachEvent(findElement(div, '.toolbar'), 'click', sh.toolbar.handler);

 			if (this.getParam('quick-code'))
 				attachEvent(findElement(div, '.code'), 'dblclick', quickCodeHandler);

 			return div;
 		},

 		/**
		 * Initializes the highlighter/brush.
		 *
		 * Constructor isn't used for initialization so that nothing executes during necessary
		 * `new SyntaxHighlighter.Highlighter()` call when setting up brush inheritence.
		 *
		 * @param {Hash} params Highlighter parameters.
		 */
 		init: function (params) {
 			this.id = guid();

 			// register this instance in the highlighters list
 			storeHighlighter(this);

 			// local params take precedence over defaults
 			this.params = merge(sh.defaults, params || {});
 		},

 		/**
		 * Converts space separated list of keywords into a regular expression string.
		 * @param {String} str    Space separated keywords.
		 * @return {String}       Returns regular expression string.
		 */
 		getKeywords: function (str) {
 			str = str
			.replace(/^\s+|\s+$/g, '')
			.replace(/\s+/g, '|')
			;

 			return '\\b(?:' + str + ')\\b';
 		},

 		/**
		 * Makes a brush compatible with the `html-script` functionality.
		 * @param {Object} regexGroup Object containing `left` and `right` regular expressions.
		 */
 		forHtmlScript: function (regexGroup) {
 			this.htmlScript = {
 				left: { regex: regexGroup.left, css: 'script' },
 				right: { regex: regexGroup.right, css: 'script' },
 				code: new XRegExp(
				"(?<left>" + regexGroup.left.source + ")" +
				"(?<code>.*?)" +
				"(?<right>" + regexGroup.right.source + ")",
				"sgi"
				)
 			};
 		}
 	}; // end of Highlighter



 	return SH;
});




// JScript



SH.brushes.js = function () {
	var keywords = 'break case catch continue ' +
						'default delete do else false  ' +
						'for function if in instanceof ' +
						'new null return super switch ' +
						'this throw true try typeof var while with'
						;

	var r = SyntaxHighlighter.regexLib;

	this.regexList = [
			{ regex: r.multiLineDoubleQuotedString, css: 'string' },			// double quoted strings
			{ regex: r.multiLineSingleQuotedString, css: 'string' },			// single quoted strings
			{ regex: r.singleLineCComments, css: 'comments' },			// one line comments
			{ regex: r.multiLineCComments, css: 'comments' },			// multiline comments
			{ regex: /\s*#.*/gm, css: 'preprocessor' },		// preprocessor tags like #region and #endregion
			{ regex: new RegExp(this.getKeywords(keywords), 'gm'), css: 'keyword' }			// keywords
	];

	this.forHtmlScript(r.scriptScriptTags);
};


SH.brushes.js.prototype = SH.Brush.prototype;
