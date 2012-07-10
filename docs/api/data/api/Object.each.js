﻿jsonp({"fullName":'Object.each',"source":'base.js',"sourceFile":'data/source/base.js.html#Object-each',"summary":'<p>\u904d\u5386\u4e00\u4e2a\u7c7b\u6570\u7ec4\uff0c\u5e76\u5bf9\u6bcf\u4e2a\u5143\u7d20\u6267\u884c\u51fd\u6570 <em>fn</em>\u3002</p>\n',"params":[{"type":'Function',"name":'fn',"summary":'<p>\u5bf9\u6bcf\u4e2a\u5143\u7d20\u8fd0\u884c\u7684\u51fd\u6570\u3002\u51fd\u6570\u7684\u53c2\u6570\u4f9d\u6b21\u4e3a:</p>\n\n<ul>\n<li>{Object} value \u5f53\u524d\u5143\u7d20\u7684\u503c\u3002</li>\n<li>{Number} index \u5f53\u524d\u5143\u7d20\u7684\u7d22\u5f15\u3002</li>\n<li>{Array} array \u5f53\u524d\u6b63\u5728\u904d\u5386\u7684\u6570\u7ec4\u3002</li>\n</ul>\n\n<p>\u53ef\u4ee5\u8ba9\u51fd\u6570\u8fd4\u56de <strong>false</strong> \u6765\u5f3a\u5236\u4e2d\u6b62\u5faa\u73af\u3002</p>\n'},{"type":'Object',"name":'bind',"defaultValue":'',"summary":'<p>\u5b9a\u4e49 <em>fn</em> \u6267\u884c\u65f6 <strong>this</strong> \u7684\u503c\u3002</p>\n'}],"returns":{"type":'Boolean',"summary":'<p>\u5982\u679c\u5faa\u73af\u662f\u56e0\u4e3a <em>fn</em> \u8fd4\u56de <strong>false</strong> \u800c\u4e2d\u6b62\uff0c\u5219\u8fd4\u56de <strong>false</strong>\uff0c \u5426\u5219\u8fd4\u56de <strong>true</strong>\u3002</p>\n'},"see":['Array#each','Array#forEach'],"example":'<pre>\nObject.each({a: \'1\', c: \'3\'}, function (value, key) {\ntrace(key + \' : \' + value);\n});\n// \u8f93\u51fa \'a : 1\' \'c : 3\'\n</pre>\n',"name":'each',"memberOf":'Object',"memberType":'method'});