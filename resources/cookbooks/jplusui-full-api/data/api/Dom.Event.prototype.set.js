﻿jsonp({"fullName":'Dom.Event.prototype.set',"source":'Base_1.js',"sourceFile":'data/source/Base_1.js.html#Dom-Event-prototype-set',"summary":'<p>\u5feb\u901f\u8bbe\u7f6e\u5f53\u524d Dom \u5bf9\u8c61\u7684\u6837\u5f0f\u3001\u5c5e\u6027\u6216\u4e8b\u4ef6\u3002</p>\n',"params":[{"type":'String/Object',"name":'name',"summary":'<p>\u5c5e\u6027\u540d\u3002\u53ef\u4ee5\u662f\u4e00\u4e2a css \u5c5e\u6027\u540d\u6216 html \u5c5e\u6027\u540d\u3002\u5982\u679c\u5c5e\u6027\u540d\u662fon\u5f00\u5934\u7684\uff0c\u5219\u88ab\u8ba4\u4e3a\u662f\u7ed1\u5b9a\u4e8b\u4ef6\u3002 - \u6216 - \u5c5e\u6027\u503c\uff0c\u8868\u793a \u5c5e\u6027\u540d/\u5c5e\u6027\u503c \u7684 JSON \u5bf9\u8c61\u3002</p>\n'},{"type":'Object',"name":'value',"defaultValue":'',"summary":'<p>\u5c5e\u6027\u503c\u3002</p>\n'}],"returns":{"type":'',"summary":'<p>this</p>\n'},"remark":'<p>\u6b64\u51fd\u6570\u76f8\u5f53\u4e8e\u8c03\u7528 setStyle \u6216 setAttr \u3002\u6570\u5b57\u5c06\u81ea\u52a8\u8f6c\u5316\u4e3a\u50cf\u7d20\u503c\u3002</p>\n',"example":'<p>\u5c06\u6240\u6709\u6bb5\u843d\u5b57\u4f53\u8bbe\u4e3a\u7ea2\u8272\u3001\u8bbe\u7f6e class \u5c5e\u6027\u3001\u7ed1\u5b9a click \u4e8b\u4ef6\u3002</p>\n\n<pre>\nDom.query(\"p\").set(\"color\",\"red\").set(\"class\",\"cls-red\").set(\"onclick\", function(){alert(\'clicked\')});\n</pre>\n\n<ul>\n<li>\u6216 -</li>\n</ul>\n\n<pre>\nDom.query(\"p\").set({\n\"color\":\"red\",\n\"class\":\"cls-red\",\n\"onclick\": function(){alert(\'clicked\')}\n});\n</pre>\n',"name":'set',"memberOf":'Dom.Event',"memberType":'method'});