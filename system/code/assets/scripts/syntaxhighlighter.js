

var SH = SH || {};

SH.brushes = {};

/** Common regular expressions. */
SH.regexLib = {
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
};

SH.highlight = function(sourceCode, language){

};