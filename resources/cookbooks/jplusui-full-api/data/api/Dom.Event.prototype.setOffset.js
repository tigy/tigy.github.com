﻿jsonp({"fullName":'Dom.Event.prototype.setOffset',"source":'Base_1.js',"sourceFile":'data/source/Base_1.js.html#Dom-Event-prototype-setOffset',"summary":'<p>\u8bbe\u7f6e\u5f53\u524d Dom \u5bf9\u8c61\u76f8\u5bf9\u7236\u5143\u7d20\u7684\u504f\u79fb\u3002</p>\n',"params":[{"type":'Point',"name":'offsetPoint',"summary":'<p>\u8981\u8bbe\u7f6e\u7684 x, y \u5bf9\u8c61\u3002</p>\n'}],"returns":{"type":'',"summary":'<p>this</p>\n'},"remark":'<p>\u6b64\u51fd\u6570\u4ec5\u6539\u53d8 CSS \u4e2d left \u548c top \u7684\u503c\u3002\n\u5982\u679c\u5f53\u524d\u5bf9\u8c61\u7684 position \u662fstatic\uff0c\u5219\u6b64\u51fd\u6570\u65e0\u6548\u3002\n\u53ef\u4ee5\u901a\u8fc7 {@link #setPosition} \u5f3a\u5236\u4fee\u6539 position, \u6216\u5148\u8c03\u7528 {@link Dom.movable} \u6765\u66f4\u6539 position \u3002</p>\n',"example":'<p>\u8bbe\u7f6e\u7b2c\u4e00\u6bb5\u7684\u504f\u79fb\u3002</p>\n\n<h5>HTML:</h5>\n\n<pre lang=\"htm\" format=\"none\">&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;</pre>\n\n<h5>JavaScript:</h5>\n\n<pre>\nDom.query(\"p:first\").setOffset({ x: 10, y: 30 });\n</pre>\n\n<h5>\u7ed3\u679c:</h5>\n\n<pre lang=\"htm\" format=\"none\">&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;left: 15, top: 15&lt;/p&gt;</pre>\n',"name":'setOffset',"memberOf":'Dom.Event',"memberType":'method'});