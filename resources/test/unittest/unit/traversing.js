module("Traversing");




function q(){
	var el = new DomList();
	Object.each(arguments, function (dom) {
		el.add(Dom.get(dom));
	});
	
	return el;
}

test("Dom.prototype.query", function() {
	expect(3);
	equal( document.query("#foo").query(".blogTest").getText(), "Yahoo", "Check for find" );

	deepEqual(document.query("#qunit-fixture").query("> div"), q("foo", "moretests", "tabindex-tests", "liveHandlerOrder", "siblingTest"), "find child elements");
	deepEqual(document.query("#qunit-fixture").query("> #foo > p"), q("sndp", "en", "sap"), "find child elements");
});

test("Dom.prototype.match", function() {
	expect(25);
	ok(Dom.find("#form").match("form"), "Check for element: A form must be a form");
	ok(!Dom.find("#form").match("div"), "Check for element: A form is not a div");
	ok(Dom.find("#mark").match(".blog"), "Check for class: Expected class 'blog'");
	ok(!Dom.find("#mark").match(".link"), "Check for class: Did not expect class 'link'");
	ok(Dom.find("#simon").match(".blog.link"), "Check for multiple classes: Expected classes 'blog' and 'link'");
	ok(!Dom.find("#simon").match(".blogTest"), "Check for multiple classes: Expected classes 'blog' and 'link', but not 'blogTest'");
	ok(Dom.find("#en").match("[lang=\"en\"]"), "Check for attribute: Expected attribute lang to be 'en'");
	ok(!Dom.find("#en").match("[lang=\"de\"]"), "Check for attribute: Expected attribute lang to be 'en', not 'de'");
	ok(Dom.find("#text1").match("[type=\"text\"]"), "Check for attribute: Expected attribute type to be 'text'");
	ok(!Dom.find("#text1").match("[type=\"radio\"]"), "Check for attribute: Expected attribute type to be 'text', not 'radio'");
	ok(Dom.find("#text2").match(":disabled"), "Check for pseudoclass: Expected to be disabled");
	ok(!Dom.find("#text1").match(":disabled"), "Check for pseudoclass: Expected not disabled");
	ok(Dom.find("#radio2").match(":checked"), "Check for pseudoclass: Expected to be checked");
	ok(!Dom.find("#radio1").match(":checked"), "Check for pseudoclass: Expected not checked");
	ok(Dom.find("#foo").match(":has(p)"), "Check for child: Expected a child 'p' element");
	ok(!Dom.find("#foo").match(":has(ul)"), "Check for child: Did not expect 'ul' element");
	ok(Dom.find("#foo").match(":has(p):has(a):has(code)"), "Check for childs: Expected 'p', 'a' and 'code' child elements");
	ok(!Dom.find("#foo").match(":has(p):has(a):has(code):has(ol)"), "Check for childs: Expected 'p', 'a' and 'code' child elements, but no 'ol'");

	// test is() with comma-seperated expressions
	ok(Dom.find("#en").match("[lang=\"en\"],[lang=\"de\"]"), "Comma-seperated; Check for lang attribute: Expect en or de");
	ok(Dom.find("#en").match("[lang=\"de\"],[lang=\"en\"]"), "Comma-seperated; Check for lang attribute: Expect en or de");
	ok(Dom.find("#en").match("[lang=\"en\"] , [lang=\"de\"]"), "Comma-seperated; Check for lang attribute: Expect en or de");
	ok(Dom.find("#en").match("[lang=\"de\"] , [lang=\"en\"]"), "Comma-seperated; Check for lang attribute: Expect en or de");

	ok(!Dom.find(window).match("a"), "Checking is on a window does not throw an exception(#10178)");
	ok(!Dom.find(document).match("a"), "Checking is on a document does not throw an exception(#10178)");

	ok(Dom.find("#option1b").match("#select1 option:not(:first-child)"), "POS inside of :not() (#10970)");
});

test("Dom.prototype.index()", function() {
	expect( 2 );

	equal( document.find("#text2").index(), 2, "Returns the index of a child amongst its siblings" );

	equal( Dom.parse("<div/>").index(), 0, "Node without parent returns 0" );
});

test("Dom.prototype.closest()", function() {
	expect(13);
	deepEqual(Dom.find("body").closest("body"), Dom.find("body"), "closest(body)");
	deepEqual(Dom.find("body").closest("html"), Dom.find("html"), "closest(html)");
	deepEqual(Dom.find("body").closest("div"), null, "closest(div)");
	deepEqual(Dom.find("#qunit-fixture").closest("span,#html"), Dom.find("html"), "closest(span,#html)");

	deepEqual(Dom.find("#qunit-fixture div:nth-child(2)").closest("div:first-child"), null, "closest(div:first-child)");
	deepEqual(Dom.find("div").closest("body:first-child div:last-child"), Dom.find("fx-tests"), "closest(body:first-child div:last-child)");

	// Test .closest() limited by the context
	var list = Dom.find("#nothiddendivchild");
	deepEqual(list.closest("html", document.body), null, "Context limited.");
	deepEqual(list.closest("body", document.body), null, "Context limited.");
	deepEqual(list.closest("#nothiddendiv", document.body), Dom.get("nothiddendiv"), "Context not reached.");

	//Test that .closest() returns unique'd set
	deepEqual(Dom.find("#qunit-fixture p").closest("#qunit-fixture"), Dom.get('qunit-fixture'), "Closest should return a unique set");

	// Test on disconnected node
	equal(Dom.parse("<div><p></p></div>").find("p").closest("table"), null, "Make sure disconnected closest work.");

	// Bug #7369
	equal(!Dom.parse("<div foo='bar'></div>").closest("[foo]"), false, "Disconnected nodes with attribute selector");
	equal(Dom.parse("<div>text</div>").closest("[lang]"), null, "Disconnected nodes with text and non-existent attribute selector");
});

test("Dom.prototype.siblings()", function() {
	expect(7);
	deepEqual(Dom.query("#en").siblings(), q("sndp", "sap"), "Check for siblings");
	deepEqual(Dom.query("#sndp").siblings(":has(code)"), q("sap"), "Check for filtered siblings (has code child element)");
	deepEqual(Dom.query("#sndp").siblings(":has(a)"), q("en", "sap"), "Check for filtered siblings (has anchor child element)");
	deepEqual(Dom.query("#foo").siblings("form, b"), q("form", "floatTest", "lengthtest", "name-tests", "testForm"), "Check for multiple filters");
	var set = navigator.isQuirks ? q("sndp", "sap") : q("en", "sap");
	deepEqual(Dom.query("#en, #sndp").siblings(), set, "Check for unique results from siblings");
	deepEqual(Dom.query("#option5a").siblings("option[data-attr]"), q("option5c"), "Has attribute selector in siblings (#9261)");
	equal(Dom.parse("<a/>").siblings().length, 0, "Detached elements have no siblings (#11370)");
});

test("Dom.prototype.children()", function() {
	expect(3);
	deepEqual(Dom.query("#foo").children(), q("sndp", "en", "sap"), "Check for children");
	deepEqual(Dom.query("#foo").children(":has(code)"), q("sndp", "sap"), "Check for filtered children");
	deepEqual(Dom.query("#foo").children("#en, #sap"), q("en", "sap"), "Check for multiple filters");
});

test("Dom.prototype.parent()", function() {
	expect(5);
	equal(Dom.query("#groups").parent().node.id, "ap", "Simple parent check");
	equal(Dom.query("#groups").parent("p").node.id, "ap", "Filtered parent check");
	equal(Dom.query("#groups").parent("div2"), null, "Filtered parent check, no match");
	equal(Dom.query("#groups").parent("div, p").node.id, "ap", "Check for multiple filters");
	deepEqual(Dom.query("#en, #sndp").parent().node, q("foo")[0], "Check for unique results from parent");
});

test("Dom.prototype.parentAll", function() {
	expect(5);
	equal(Dom.query("#groups").parentAll()[0].id, "ap", "Simple parents check");
	equal(Dom.query("#groups").parentAll("p")[0].id, "ap", "Filtered parents check");
	equal(Dom.query("#groups").parentAll("div")[0].id, "qunit-fixture", "Filtered parents check2");
	deepEqual(Dom.query("#groups").parentAll("p, div").slice(0, 2), q("ap", "qunit-fixture"), "Check for multiple filters");
	deepEqual(Dom.query("#en, #sndp").parentAll().slice(0, 3), q("foo", "qunit-fixture", "dl"), "Check for unique results from parents");
});

test("Dom.prototype.next()", function() {
	expect(4);
	equal(Dom.query("#ap").next().node.id, "foo", "Simple next check");
	equal(Dom.query("#ap").next("div").node.id, "foo", "Filtered next check");
	equal(Dom.query("#ap").next("p"), null, "Filtered next check, no match");
	equal(Dom.query("#ap").next("div, p").node.id, "foo", "Multiple filters");
});

test("Dom.prototype.prev()", function() {
	expect(4);
	equal(Dom.query("#foo").prev().node.id, "ap", "Simple prev check");
	equal(Dom.query("#foo").prev("p").node.id, "ap", "Filtered prev check");
	equal(Dom.query("#foo").prev("div"), null, "Filtered prev check, no match");
	equal(Dom.query("#foo").prev("p, div").node.id, "ap", "Multiple filters");
});

test("Dom.prototype.nextAll()", function() {
	expect(4);

	var elems = Dom.query("#form").children();

	deepEqual(Dom.query("#label-for").nextAll(), elems.filter(":not(:first-child)"), "Simple nextAll check");
	deepEqual(Dom.query("#label-for").nextAll("input"), elems.filter(":not(:first-child)").filter("input"), "Filtered nextAll check");
	deepEqual(Dom.query("#label-for").nextAll("input,select"), elems.filter(":not(:first-child)").filter("input,select"), "Multiple-filtered nextAll check");
	deepEqual(Dom.query("#label-for, #hidden1").nextAll("input,select"), elems.filter(":not(:first-child)").filter("input,select"), "Multi-source, multiple-filtered nextAll check");
});

test("Dom.prototype.getElements", function() {
	expect(2);

	deepEqual(document.getElements("body")[0], document.body, "Simple getElements check");
	deepEqual(document.getElements("html")[0], document.documentElement, "Simple getElements check");
});