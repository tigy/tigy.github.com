﻿jsonp({"fullName":'addCssRule',"source":'System\\Dom\\assets\\scripts\\CssRule.js',"sourceFile":'data/source/System\\Dom\\assets\\scripts\\CssRule.js.html#addCssRule',"summary":'<p>APIMethod: insertCssRule\ninsert a new dynamic rule into the given stylesheet.  If no name is\ngiven for the stylesheet then the default stylesheet is used.</p>\n\n<p>Parameters:\nselector - <String> the CSS selector for the rule\ndeclaration - <String> CSS-formatted rules to include.  May be empty,\nin which case you may want to use the returned rule object to\nmanipulate styles\nstyleSheetName - <String> the name of the sheet to place the rules in,\nor empty to put them in a default sheet.</p>\n\n<p>Returns:\n<CSSRule> - a CSS Rule object with properties that are browser\ndependent.  In general, you can use rule.styles to set any CSS\nproperties in the same way that you would set them on a DOM object.</p>\n',"name":'addCssRule',"memberOf":'',"memberType":'method',"params":[{"type":'',"name":'selector',"summary":''},{"type":'',"name":'declaration',"summary":''},{"type":'',"name":'styleSheetName',"summary":''}]});