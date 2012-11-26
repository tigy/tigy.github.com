﻿jsonp({"fullName":'Dom.Event.prototype.setPosition',"source":'Base_1.js',"sourceFile":'data/source/Base_1.js.html#Dom-Event-prototype-setPosition',"summary":'<p>\u8bbe\u7f6e\u5f53\u524d Dom \u5bf9\u8c61\u7684\u7edd\u5bf9\u4f4d\u7f6e\u3002</p>\n',"params":[{"type":'Number/Point',"name":'x',"summary":'<p>\u8981\u8bbe\u7f6e\u7684\u6c34\u5e73\u5750\u6807\u6216\u4e00\u4e2a\u5305\u542b x\u3001y \u5c5e\u6027\u7684\u5bf9\u8c61\u3002\u5982\u679c\u4e0d\u8bbe\u7f6e\uff0c\u4f7f\u7528 null \u3002</p>\n'},{"type":'Number',"name":'y',"summary":'<p>\u8981\u8bbe\u7f6e\u7684\u5782\u76f4\u5750\u6807\u3002\u5982\u679c\u4e0d\u8bbe\u7f6e\uff0c\u4f7f\u7528 null \u3002</p>\n'}],"returns":{"type":'',"summary":'<p>this</p>\n'},"remark":'<p>\u5982\u679c\u5bf9\u8c61\u539f\u5148\u7684position\u6837\u5f0f\u5c5e\u6027\u662fstatic\u7684\u8bdd\uff0c\u4f1a\u88ab\u6539\u6210relative\u6765\u5b9e\u73b0\u91cd\u5b9a\u4f4d\u3002</p>\n',"example":'<p>\u8bbe\u7f6e\u7b2c\u4e8c\u6bb5\u7684\u4f4d\u7f6e\u3002</p>\n\n<h5>HTML:</h5>\n\n<pre lang=\"htm\" format=\"none\">\n&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;\n</pre>\n\n<h5>JavaScript:</h5>\n\n<pre>\nDom.query(\"p:last\").setPosition({ x: 10, y: 30 });\n</pre>\n',"name":'setPosition',"memberOf":'Dom.Event',"memberType":'method'});