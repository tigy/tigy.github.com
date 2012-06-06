module("traversing");




function q(){
	var el = new DomList();
	Object.each(arguments, function (dom) {
		el.push(Dom.get(dom).dom);
	});
	
	return el;
}

test("Dom.prototype.query", function() {
	equal( document.query("#foo").query(".blogTest").getText().join(''), "Yahoo", "Check for find" );

	deepEqual( document.query("#qunit-fixture").query("> div"), q("foo", "moretests", "tabindex-tests", "liveHandlerOrder", "siblingTest"), "find child elements" );
	deepEqual( document.query("#qunit-fixture").query("> #foo > p"), q("sndp", "en", "sap"), "find child elements" );
});

test("Dom.prototype.index()", function() {
	expect( 2 );

	equal( document.find("#text2").index(), 2, "Returns the index of a child amongst its siblings" );

	equal( Dom.parse("<div/>").index(), 0, "Node without parent returns 0" );
});

test("Dom.prototype.getAll('sibling')", function() {
	deepEqual( Dom.get("en").getAll('sibling'), q("sndp", "sap"), "Check for siblings" );
});

test("Dom.prototype.children()", function() {
	deepEqual(  Dom.get("foo").children(), q("sndp", "en", "sap"), "Check for children" );
});

test("Dom.prototype.parent()", function() {
	equal(  Dom.get("groups").parent().dom.id, "ap", "Simple parent check" );
	equal(  Dom.get("groups").parent("p").dom.id, "ap", "Filtered parent check" );
	equal(  Dom.get("groups").parent("div2"), null, "Filtered parent check, no match" );
});

test("Dom.prototype.getAll('parent')", function() {
	equal( Dom.get("groups").getAll('parent')[0].id, "ap", "Simple parents check" );
	equal( Dom.get("groups").getAll('parent', "p")[0].id, "ap", "Filtered parents check" );
	equal( Dom.get("groups").getAll('parent', "div")[0].id, "qunit-fixture", "Filtered parents check2" );
});

test("Dom.prototype.next()", function() {
	equal( Dom.get("ap").next().dom.id, "foo", "Simple next check" );
	equal( Dom.get("ap").next("div").dom.id, "foo", "Filtered next check" );
	equal( Dom.get("ap").next("p2"), null, "Filtered next check, no match" );
});

test("Dom.prototype.prev()", function() {
	equal( Dom.get("foo").prev().dom.id, "ap", "Simple prev check" );
	equal( Dom.get("foo").prev("p").dom.id, "ap", "Filtered prev check" );
	equal( Dom.get("foo").prev("div2"), null, "Filtered prev check, no match" );
});

test("Dom.prototype.getAll('prev')", function() {

	var elems = Dom.get("form").children().slice(0, 12).reverse();

	deepEqual( Dom.get("area1").getAll('prev'), elems, "Simple prevAll check" );
});

test("Dom.prototype.getAll('next')", function() {

	var elems = document.query("form").children().slice( 2, 12 );

	deepEqual( document.query("text1").getAll('next'), document.query("text1").getAll('next'), "nextUntil with no selector (nextAll)" );
});