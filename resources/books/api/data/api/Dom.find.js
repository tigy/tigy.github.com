﻿jsonp({"fullName":'Dom.find',"source":'base_1.js',"sourceFile":'data/source/base_1.js.html#Dom-find',"summary":'<p>\u6267\u884c\u4e00\u4e2a CSS \u9009\u62e9\u5668\uff0c\u8fd4\u56de\u7b2c\u4e00\u4e2a\u5143\u7d20\u5bf9\u5e94\u7684 {@link Dom} \u5bf9\u8c61\u3002</p>\n',"params":[{"type":'String/NodeList/DomList/Array/Node',"name":'\u7528\u6765\u67e5\u627e\u7684',"summary":'<p>CSS \u9009\u62e9\u5668\u6216\u539f\u751f\u7684 DOM \u8282\u70b9\u3002</p>\n'}],"returns":{"type":'Element',"summary":'<p>\u5982\u679c\u6ca1\u6709\u5bf9\u5e94\u7684\u8282\u70b9\u5219\u8fd4\u56de\u4e00\u4e2a\u7a7a\u7684 DomList \u5bf9\u8c61\u3002</p>\n'},"memberAttribute":'static',"see":['DomList'],"example":'<p>\u627e\u5230\u7b2c\u4e00\u4e2a p \u5143\u7d20\u3002</p>\n\n<h5>HTML:</h5>\n\n<pre lang=\"htm\" format=\"none\">\n&lt;p&gt;one&lt;/p&gt; &lt;div&gt;&lt;p&gt;two&lt;/p&gt;&lt;/div&gt; &lt;p&gt;three&lt;/p&gt;\n</pre>\n\n<h5>Javascript:</h5>\n\n<pre>\nDom.find(\"p\");\n</pre>\n\n<h5>\u7ed3\u679c:</h5>\n\n<pre lang=\"htm\" format=\"none\">\n{  &lt;p&gt;one&lt;/p&gt;  }\n</pre>\n\n<p><br>\n\u627e\u5230\u7b2c\u4e00\u4e2a p \u5143\u7d20\uff0c\u5e76\u4e14\u8fd9\u4e9b\u5143\u7d20\u90fd\u5fc5\u987b\u662f div \u5143\u7d20\u7684\u5b50\u5143\u7d20\u3002</p>\n\n<h5>HTML:</h5>\n\n<pre lang=\"htm\" format=\"none\">\n&lt;p&gt;one&lt;/p&gt; &lt;div&gt;&lt;p&gt;two&lt;/p&gt;&lt;/div&gt; &lt;p&gt;three&lt;/p&gt;</pre>\n\n<h5>Javascript:</h5>\n\n<pre>\nDom.find(\"div &gt; p\");\n</pre>\n\n<h5>\u7ed3\u679c:</h5>\n\n<pre lang=\"htm\" format=\"none\">\n{ &lt;p&gt;two&lt;/p&gt; }\n</pre>\n',"name":'find',"memberOf":'Dom',"memberType":'method'});