module("Dom");

test("基本坏境", function () {
	expect(3);
	ok( Dom, "Dom" );
	ok(Dom.get, "Dom.get");

	var el = new Dom(document);
	equal(el.node, document, "node 属性");
});

test("DomList", function () {
	var el = new DomList(document.getElementsByTagName('span'));
	var length = el.length;
	equal(length > 0, true, "可以获取长度");

	el.push(document.body);
	equal(el.length, length + 1, "push() 增加长度");
	equal(el[length], document.body, "push() 添加到最后一个元素");

	el.unshift(document.body);
	equal(el.length, length + 2, "unshift() 增加长度");
	equal(el[0], document.body, "unshift() 添加到第一个元素");

	equal(el.shift(), document.body, "shift() 移除返回第一个。");
	equal(el.length, length + 1, "shift() 减少长度");

	equal(el.pop(), document.body, "pop() 移除返回最后一个。");
	equal(el.length, length, "pop() 减少长度");

	deepEqual(el.filter(function () {  return true }).length, el.length, "filter() 返回");

	deepEqual(el.filter(function () { return  false }).length, 0, "filter() 返回");

	equal(el.indexOf(document), -1, "indexOf() 返回");

	el.each(function (node) { node.foo = "zoo"; });
	var pass = true;
	for (var i = 0; i < el.length; i++) {
		if (el[i].foo != "zoo") pass = false;
	}
	ok(pass, "each() 执行");

	equal(el.item(-1).node, el[el.length - 1], "item(-1) 返回最后的节点。");
});

test("Dom.get", function () {
	Dom.parse('<div id="a"></div>').appendTo("qunit-fixture");
	var el = Dom.get('a');
	equal(el.node.tagName, 'DIV', "成功创建");
	equal(el.append, Dom.prototype.append, "包括 Dom 方法");
});

test("Dom.parse", function() {
	var elem = Dom.parse("<div/><hr/><code/><b/>");
	equal( elem.length, 4, "节点个数" );

	for ( var i = 0; i < 3; ++i ) {
		elem = Dom.parse("<input type='text' value='TEST' />");
	}
	equal( elem.node.value, "TEST", "默认值" );

	elem.remove();

	equal( Dom.parse(" <div/> ").node.tagName, 'DIV', "确保空白被删除" );
	equal( Dom.parse(" a<div/>b ").length, 3, "确保空白被删除" );

	var long1 = "";
	for ( var i = 0; i < 128; i++ ) {
		long1 += "12345678";
	}

	equal( Dom.parse(" <div/> ").node.tagName, 'DIV', "确保空白被删除" );
	equal( Dom.parse(" a<div/>b ").length, 3, "确保空白被删除" );

	// Test multi-line HTML
	var div = Dom.parse("<div>\r\nsome text\n<p>some p</p>\nmore text\r\n</div>").node;
	equal( div.nodeName.toUpperCase(), "DIV", "Make sure we're getting a div." );
	equal( div.firstChild.nodeType, 3, "Text node." );
	equal( div.lastChild.nodeType, 3, "Text node." );
	equal( div.childNodes[1].nodeType, 1, "Paragraph." );
	equal( div.childNodes[1].firstChild.nodeType, 3, "Paragraph text." );

	QUnit.reset();
	//ok( Element.parse("<link rel='stylesheet'/>"), "Creating a link" );

	//  ok( Element.parse("<input/>").setAttr("type", "hidden"), "Create an input and set the type." );

	var j = Dom.parse("<span>hi</span> there <!-- mon ami -->");
	ok( j.length >= 2, "Check node,textnode,comment creation (some browsers delete comments)" );

	ok( !Dom.parse("<option>test</option>").node.selected, "Make sure that options are auto-selected" );

	ok( Dom.parse("<div></div>").node, "Create a div with closing tag." );
	ok( Dom.parse("<table></table>").node, "Create a table with closing tag." );

	// Test very large html string
	var i;
	var li = "<li>very large html string</li>";
	var html = ["<ul>"];
	for ( i = 0; i < 50000; i += 1 ) {
		html.push(li);
	}
	html.push("</ul>");
	html = Dom.parse(html.join("")).node;
	equal( html.nodeName.toUpperCase(), "UL");
	equal( html.firstChild.nodeName.toUpperCase(), "LI");
	equal( html.childNodes.length, 50000 );
	
	
	var div = Dom.parse("<div/>").node;
	var span = Dom.parse("<span/>", div).node;
	equal(span.tagName, 'SPAN', "Verify a span created with a div context works");

});

test("Dom.create",  function() {
	var el = Dom.create('div');
	equal(el.node.tagName, 'DIV', "成功创建");
	equal(el.append, Dom.prototype.append, "包括 Element 方法");
});