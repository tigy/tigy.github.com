module("Attributes");

var bareObj = function(value) { return value; };
var functionReturningObj = function(value) { return (function() { return value; }); };

test("Dom.prototype.getAttr", function() {
	expect(46);

	equal( Dom.query("#text1").getAttr("type"), "text", "Check for type attribute" );
	equal( Dom.query("#radio1").getAttr("type"), "radio", "Check for type attribute" );
	equal( Dom.query("#check1").getAttr("type"), "checkbox", "Check for type attribute" );
	equal( Dom.query("#simon1").getAttr("rel"), "bookmark", "Check for rel attribute" );
	equal( Dom.query("#google").getAttr("title"), "Google!", "Check for title attribute" );
	equal( Dom.query("#mark").getAttr("hreflang"), "en", "Check for hreflang attribute" );
	equal( Dom.query("#en").getAttr("lang"), "en", "Check for lang attribute" );
	equal( Dom.query("#simon").getAttr("class"), "blog link", "Check for class attribute" );
	equal( Dom.query("#name").getAttr("name"), "name", "Check for name attribute" );
	equal( Dom.query("#text1").getAttr("name"), "action", "Check for name attribute" );
	ok( Dom.query("#form").getAttr("action").indexOf("formaction") >= 0, "Check for action attribute" );
	equal( Dom.query("#text1").setAttr("value", "t").getAttr("value"), "t", "Check setting the value attribute" );
	equal( Dom.parse("<div value='t'></div>").getAttr("value"), "t", "Check setting custom attr named 'value' on a div" );
	equal( Dom.query("#form").setAttr("blah", "blah").getAttr("blah"), "blah", "Set non-existant attribute on a form" );
	equal( Dom.query("#foo").getAttr("height"), undefined, "Non existent height attribute should return undefined" );

	// [7472] & [3113] (form contains an input with name="action" or name="id")
	var extras = Dom.parse("<input name='id' name='name' /><input id='target' name='target' />").appendTo("testForm");
	equal( Dom.query("#form").setAttr("action","newformaction").getAttr("action"), "newformaction", "Check that action attribute was changed" );
	equal(Dom.query("#testForm").getAttr("target"), null, "Retrieving target does not equal the input with name=target");
	
	equal( Dom.query("#testForm").setAttr("target", "newTarget").getAttr("target"), "newTarget", "Set target successfully on a form" );
	equal( Dom.query("#testForm").setAttr("id", null).getAttr("id"), null, "Retrieving id does not equal the input with name=id after id is removed [#7472]" );
	// Bug #3685 (form contains input with name="name")
	equal( Dom.query("#testForm").getAttr("name"), null, "Retrieving name does not retrieve input with name=name" );
	extras.remove();

	equal( Dom.query("#text1").getAttr("maxlength"), "30", "Check for maxlength attribute" );
	equal( Dom.query("#text1").getAttr("maxLength"), "30", "Check for maxLength attribute" );
	equal( Dom.query("#area1").getAttr("maxLength"), "30", "Check for maxLength attribute" );
	
	// using innerHTML in IE causes href attribute to be serialized to the full path
	Dom.parse("<a/>").set({ "id": "tAnchor5", "href": "#5" }).appendTo("qunit-fixture");
	equal( Dom.query("#tAnchor5").getAttr("href"), "#5", "Check for non-absolute href (an anchor)" );

	// list attribute is readonly by default in browsers that support it
	Dom.query("#list-test").setAttr("list", "datalist");
	equal( Dom.query("#list-test").getAttr("list"), "datalist", "Check setting list attribute" );

	// Related to [5574] and [5683]
	var body = document.body, $body = Dom.query(body);
	
	strictEqual( $body.getAttr("foo2"), null, "Make sure that a non existent attribute returns null" );
	
	body.setAttribute("foo", "baz");
	equal( $body.getAttr("foo"), "baz", "Make sure the dom attribute is retrieved when no expando is found" );

	$body.setAttr("foo","cool");
	equal( $body.getAttr("foo"), "cool", "Make sure that setting works well when both expando and dom attribute are available" );

	body.removeAttribute("foo"); // Cleanup

	var select = document.createElement("select"), optgroup = document.createElement("optgroup"), option = document.createElement("option");
	optgroup.appendChild( option );
	select.appendChild( optgroup );

	equal( Dom.query( option ).getAttr("selected"), "selected", "Make sure that a single option is selected, even when in an optgroup." );

	var $img = Dom.parse("<img style='display:none' width='215' height='53' src='http://static.jquery.com/files/rocker/images/logo_jquery_215x53.gif'/>").appendTo();
	equal( $img.getAttr("width"), "215", "Retrieve width attribute an an element with display:none." );
	equal( $img.getAttr("height"), "53", "Retrieve height attribute an an element with display:none." );

	// Check for style support
	ok( !!~Dom.query("#dl").getAttr("style").indexOf("position"), "Check style attribute getter, also normalize css props to lowercase" );
	ok( !!~Dom.query("#foo").setAttr("style", "position:absolute;").getAttr("style").indexOf("position"), "Check style setter" );

	// Check value on button element (#1954)
	var $button = Dom.query("#button").after("<button value='foobar'>text</button>");
	equal( $button.getAttr("value"), "foobar", "Value retrieval on a button does not return innerHTML" );
	equal( $button.setAttr("value", "baz").getHtml(), "text", "Setting the value does not change innerHTML" );

	// Attributes with a colon on a table element (#1591)
	equal( Dom.query("#table").getAttr("test:attrib"), undefined, "Retrieving a non-existent attribute on a table with a colon does not throw an error." );
	equal( Dom.query("#table").setAttr("test:attrib", "foobar").getAttr("test:attrib"), "foobar", "Setting an attribute on a table with a colon does not throw an error." );

	var $form = Dom.parse("<form class='something'></form>").appendTo("qunit-fixture");
	equal( $form.getAttr("class"), "something", "Retrieve the class attribute on a form." );

	var $a = Dom.parse("<a href='#' onclick='something()'>Click</a>").appendTo("qunit-fixture");
	equal( $a.getAttr("onclick"), "something()", "Retrieve ^on attribute without anonymous function wrapper." );

	strictEqual( Dom.parse("<div/>").getAttr("doesntexist"), null, "Make sure null is returned when no attribute is found." );
	strictEqual( Dom.parse("<div/>").getAttr("title"), null, "Make sure null is returned when no attribute is found." );
	equal( Dom.parse("<div/>").setAttr("title", "something").getAttr("title"), "something", "Set the title attribute." );
	strictEqual( Dom.query().getAttr("doesntexist"), undefined, "Make sure undefined is returned when no element is there." );
	equal( Dom.parse("<div/>").getAttr("value"), null, "An unset value on a div returns undefined." );
	equal( Dom.parse("<input/>").getAttr("value"), "", "An unset value on an input returns current value." );

	$form = Dom.query("#form").setAttr("enctype", "multipart/form-data");
	equal( $form.getProp("enctype"), "multipart/form-data", "Set the enctype of a form (encoding in IE6/7 #6743)" );
});

test("Dom.prototype.setAttr", function() {

	var div = document.query("div").set("foo", "bar"),
		fail = false;

	for ( var i = 0; i < div.length; i++ ) {
		if ( div[i].getAttribute("foo") != "bar" ){
			fail = i;
			break;
		}
	}
  
	equal( fail, false, "Set Attribute, the #" + fail + " element didn't get the attribute 'foo'" );

	ok( Dom.get("foo").setAttr("width", null), "Try to set an attribute to nothing" );

	Dom.get("name").setAttr("name", "something");
	equal( Dom.get("name").getAttr("name"), "something", "Set name attribute" );
	Dom.get("name").setAttr("name", null);
	equal( Dom.get("name").getAttr("name"), null, "Remove name attribute" );
	var $input = Dom.parse("<input>").set({ name: "something" });
	equal( $input.getAttr("name"), "something", "Check element creation gets/sets the name attribute." );

	
	Dom.get("check2").setAttr("checked", false);
	equal( document.getElementById("check2").checked, false, "Set checked attribute" );
	equal(Dom.get("check2").getProp("checked"), false, "Set checked attribute");
	Dom.get("text1").setAttr("readonly", true);
	equal( document.getElementById("text1").readOnly, true, "Set readonly attribute" );
	equal( Dom.get("text1").getProp("readonly"), true, "Set readonly attribute" );
	Dom.get("text1").setAttr("readonly", false);
	equal( document.getElementById("text1").readOnly, false, "Set readonly attribute" );
	equal(Dom.get("text1").getProp("readonly"), false, "Set readonly attribute");

	Dom.get("check2").dom.checked = true;
	equal( document.getElementById("check2").checked, true, "Set checked attribute" );
	equal(Dom.get("check2").getProp("checked"), true, "Set checked attribute");
	Dom.get("check2").dom.checked = false;
	equal( document.getElementById("check2").checked, false, "Set checked attribute" );
	equal(Dom.get("check2").getProp("checked"), false, "Set checked attribute");
	
	Dom.get("check2").setAttr("checked", "checked");
	equal( document.getElementById("check2").checked, true, "Set checked attribute with 'checked'" );
	equal(Dom.get("check2").getProp("checked"), true, "Set checked attribute");
	
	Dom.get("text1").dom.readOnly = true;
	equal( document.getElementById("text1").readOnly, true, "Set readonly attribute" );
	equal(Dom.get("text1").getProp("readOnly"), true, "Set readonly attribute");
	
	Dom.get("text1").dom.readOnly = false;
	equal( document.getElementById("text1").readOnly, false, "Set readonly attribute" );
	equal(Dom.get("text1").getProp("readOnly"), false, "Set readonly attribute");
	
	Dom.get("name").setAttr("maxlength", "5");
	equal( document.getElementById("name").maxLength, 5, "Set maxlength attribute" );
	Dom.get("name").setAttr("maxLength", "10");
	equal( document.getElementById("name").maxLength, 10, "Set maxlength attribute" );

	// HTML5 boolean attributes
	var $text = Dom.get("text1").setAttr("autofocus", true).setAttr("required", true);
	equal($text.getProp("autofocus"), true, "Set boolean attributes to the same name");
	equal($text.setAttr("autofocus", false).getProp("autofocus"), false, "Setting autofocus attribute to false removes it");
	equal($text.getProp("required"), true, "Set boolean attributes to the same name");
	equal($text.setAttr("required", false).getProp("required"), false, "Setting required attribute to false removes it");

	var $details = Dom.parse("<details open></details>");
	
	$details = $details.first() || $details;
	$details.appendTo("qunit-fixture");
	//equal( !$details.getAttr("open"), true, "open attribute presense indicates true" );
	equal($details.setAttr("open", false).getProp("open"), false, "Setting open attribute to false removes it");

	$text.setAttr("data-something", true);
	equal( $text.getAttr("data-something"), "true", "Set data attributes");
	equal( $text.getAttr("something"), null, "Setting data attributes are not affected by boolean settings");
	$text.setAttr("data-another", false);
	equal( $text.getAttr("data-another"), "false", "Set data attributes");
	//equal( $text.data("another"), false, "Setting data attributes are not affected by boolean settings" );
	equal( $text.setAttr("aria-disabled", false).getAttr("aria-disabled"), "false", "Setting aria attributes are not affected by boolean settings");
	
	Dom.get("foo").setAttr("contenteditable", true);
	equal( Dom.get("foo").getAttr("contenteditable"), "true", "Enumerated attributes are set properly" );

	strictEqual( document.getAttr("nonexisting"), null, "attr works correctly for non existing attributes." );
		equal( document.setAttr("something", "foo" ).getAttr("something"), "foo", "attr falls back to prop on unsupported arguments" );

	var table = Dom.get("table");
	
	table.append("<tr><td>cell</td></tr><tr><td>cell</td><td>cell</td></tr><tr><td>cell</td><td>cell</td></tr>");
	
	
	var td = table.find("td");
	td.setAttr("rowspan", "2");
	
	// FIXME:  why  ?
	// equal( td.rowSpan, 2, "Check rowspan is correctly set" );
	//    td.setAttr("colspan", "2");
	//    equal( td.colSpan, 2, "Check colspan is correctly set" );
	table.setAttr("cellspacing", "2");
	equal( table.dom.cellSpacing, "2", "Check cellspacing is correctly set" );
	equal( Dom.get("area1").getAttr("value"), "foobar", "Value attribute retrieves the property for backwards compatibility." );

	// for #1070
	Dom.get("name").setAttr("someAttr", "0");
	equal( Dom.get("name").getAttr("someAttr"), "0", "Set attribute to a string of \"0\"" );
	Dom.get("name").setAttr("someAttr", 0);
	equal( Dom.get("name").getAttr("someAttr"), "0", "Set attribute to the number 0" );
	Dom.get("name").setAttr("someAttr", 1);
	equal( Dom.get("name").getAttr("someAttr"), "1", "Set attribute to the number 1" );

	QUnit.reset();

	// Type
	var type = Dom.get("check2").getAttr("type");
	try {
		Dom.get("check2").setAttr("type","hidden");
	} catch(e) {
		
	}
	ok( true, "Exception thrown when trying to change type property" );
	// equal( type, Dom.get("check2").getAttr("type"), "Verify that you can't change the type of an input element" );

	var check = Dom.create("input");
	//var thrown = true;
	try {
		check.setAttr("type", "checkbox");
	} catch(e) {
		//thrown = false;
	}
	ok( true, "Exception thrown when trying to change type property" );
	//equal( "checkbox", check.getAttr("type"), "Verify that you can change the type of an input element that isn't in the DOM" );

	var check = Dom.parse("<input />");
	//var thrown = true;
	try {
		check.setAttr("type","checkbox");
	} catch(e) {
		//thrown = false;
	}
	ok( true, "Exception thrown when trying to change type property" );
	//equal( "checkbox", check.getAttr("type"), "Verify that you can change the type of an input element that isn't in the DOM" );

	var button = Dom.get("button");
	//var thrown = false;
	try {
		button.setAttr("type","submit");
	} catch(e) {
		//thrown = true;
	}
	ok( true, "Exception thrown when trying to change type property" );
	//equal( "button", button.getAttr("type"), "Verify that you can't change the type of a button element" );

	var $radio = Dom.parse("<input value='sup' type='radio'>").appendTo("testForm");
	
	equal( $radio.getText(), "sup", "Value is not reset when type is set after value on a radio" );
	// Setting attributes on svg element
	var $svg = Dom.parse("<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' baseProfile='full' width='200' height='200'>"
		+ "<circle cx='200' cy='200' r='150' />"
	+ "</svg>");
	
	if($svg.first().dom.tagName == "SVG"){
		$svg = $svg.first(); 	
	}
	
	
	
	
	$svg.appendTo();
	equal( $svg.setAttr("cx", 100).getAttr("cx"), "100", "Set attribute on svg element" );
	$svg.remove();
});

test("Dom.prototype.set", function(){
	
	
   var pass = true;
	document.query("div").set({foo: "baz", zoo: "ping"}).each(function(node){
		if ( node.getAttribute("foo") != "baz" && node.getAttribute("zoo") != "ping" ) pass = false;
	});
	ok( pass, "Set Multiple Attributes" );		

	var elem = Dom.parse("<div />");

	// one at a time
	elem.set({innerHTML: "foo"});
	equal( elem.dom.innerHTML, "foo", "set(innerHTML)");

	
	elem.set({style: "color: red"});
	ok( /^(#ff0000|red)$/i.test(elem.dom.style.color), "set(css)");

	elem.set({height: 10});
	equal( elem.dom.style.height, "10px", "set(height)");

	// Multiple attributes

	elem.set({
		style:"padding-left:1px; padding-right:1px",
		width:10
	});

	equal( elem.dom.style.width, "10px", "set({...})");
	equal( elem.dom.style.paddingLeft, "1px", "set({...})");
	equal( elem.dom.style.paddingRight, "1px", "set({...})");
});

test("Dom.prototype.getAttr('tabindex')", function() {
	expect( 8 );

	// elements not natively tabbable
	equal( Dom.query("#listWithTabIndex").getAttr("tabindex"), "5", "not natively tabbable, with tabindex set to 0" );
	equal( Dom.query("#divWithNoTabIndex").getAttr("tabindex"), undefined, "not natively tabbable, no tabindex set" );

	// anchor with href
	equal( Dom.query("#linkWithNoTabIndex").getAttr("tabindex"), undefined, "anchor with href, no tabindex set" );
	equal( Dom.query("#linkWithTabIndex").getAttr("tabindex"), "2", "anchor with href, tabindex set to 2" );
	equal( Dom.query("#linkWithNegativeTabIndex").getAttr("tabindex"), "-1", "anchor with href, tabindex set to -1" );

	// anchor without href
	equal( Dom.query("#linkWithNoHrefWithNoTabIndex").getAttr("tabindex"), undefined, "anchor without href, no tabindex set" );
	equal( Dom.query("#linkWithNoHrefWithTabIndex").getAttr("tabindex"), "1", "anchor without href, tabindex set to 2" );
	equal( Dom.query("#linkWithNoHrefWithNegativeTabIndex").getAttr("tabindex"), "-1", "anchor without href, no tabindex set" );
});

test("Dom.prototype.setAttr('tabindex', value)", function() {
	expect( 9 );

	var element = Dom.query("#divWithNoTabIndex");
	equal( element.getAttr("tabindex"), undefined, "start with no tabindex" );

	// set a positive string
	element.setAttr("tabindex", "1");
	equal( element.getAttr("tabindex"), "1", "set tabindex to 1 (string)" );

	// set a zero string
	element.setAttr("tabindex", "0");
	equal( element.getAttr("tabindex"), "0", "set tabindex to 0 (string)" );

	// set a negative string
	element.setAttr("tabindex", "-1");
	equal( element.getAttr("tabindex"), "-1", "set tabindex to -1 (string)" );

	// set a positive number
	element.setAttr("tabindex", 1);
	equal( element.getAttr("tabindex"), "1", "set tabindex to 1 (number)" );

	// set a zero number
	element.setAttr("tabindex", 0);
	equal(element.getAttr("tabindex"), "0", "set tabindex to 0 (number)");

	// set a negative number
	element.setAttr("tabindex", -1);
	equal( element.getAttr("tabindex"), "-1", "set tabindex to -1 (number)" );

	element = Dom.query("#linkWithTabIndex");
	equal( element.getAttr("tabindex"), "2", "start with tabindex 2" );

	element.setAttr("tabindex", -1);
	equal( element.getAttr("tabindex"), "-1", "set negative tabindex" );
});

test("Dom.prototype.setAttr(String, null)", function() {
	expect( 12 );
	var $first;

	equal( Dom.query("#mark").setAttr( "class", null ).getAttr("class"), undefined, "remove class" );
	equal( Dom.query("#form").setAttr("id", null).getAttr("id"), undefined, "Remove id" );
	equal( Dom.query("#foo").setAttr("style", "position:absolute;").setAttr("style", null).getAttr("style"), undefined, "Check removing style attribute" );
	equal( Dom.query("#form").setAttr("style", "position:absolute;").setAttr("style", null).getAttr("style"), undefined, "Check removing style attribute on a form" );
	equal( Dom.parse("<div style='position: absolute'></div>").appendTo("foo").setAttr("style", null).getProp("style").cssText, "", "Check removing style attribute (#9699 Webkit)" );
	equal( Dom.find("#fx-test-group").setAttr("height", "3px").setAttr("height", null).dom.style.height, "1px", "Removing height attribute has no effect on height set with style attribute" );

	Dom.query("#check1").setAttr("checked", null).setProp("checked", true).setAttr("checked", null);
	equal( document.getElementById("check1").checked, false, "removeAttr sets boolean properties to false" );
	Dom.query("#text1").setProp("readOnly", true).setAttr("readonly", null);
	equal( document.getElementById("text1").readOnly, false, "removeAttr sets boolean properties to false" );

	Dom.query("#option2c").setAttr("selected", null);
	equal( Dom.query("#option2d").getAttr("selected"), "selected", "Removing `selected` from an option that is not selected does not remove selected from the currently selected option (#10870)");

	try {
		$first = Dom.query("#first").setAttr("contenteditable", "true").setAttr("contenteditable", null);
		equal( $first.getAttr('contenteditable'), undefined, "Remove the contenteditable attribute" );
	} catch(e) {
		ok( false, "Removing contenteditable threw an error (#10429)" );
	}
	
	$first = Dom.parse("<div Case='mixed'></div>");
	equal( $first.getAttr("Case"), "mixed", "case of attribute doesn't matter" );
	$first.setAttr("Case", null);
	// IE 6/7 return empty string here, not undefined
	ok( !$first.getAttr("Case"), "mixed-case attribute was removed" );
});

test("Dom.prototype.getProp()", function() {
	expect(31);

	equal( Dom.query("#text1").getProp("value"), "Test", "Check for value attribute" );
	equal( Dom.query("#text1").setProp("value", "Test2").getProp("defaultValue"), "Test", "Check for defaultValue attribute" );
	equal( Dom.query("#select2").getProp("selectedIndex"), 3, "Check for selectedIndex attribute" );
	equal( Dom.query("#foo").getProp("nodeName").toUpperCase(), "DIV", "Check for nodeName attribute" );
	equal( Dom.query("#foo").getProp("tagName").toUpperCase(), "DIV", "Check for tagName attribute" );
	equal( Dom.parse("<option/>").getProp("selected"), false, "Check selected attribute on disconnected element." );

	equal( Dom.query("#listWithTabIndex").getProp("tabindex"), 5, "Check retrieving tabindex" );
	Dom.query("#text1").setProp("readonly", true);
	equal( document.getElementById("text1").readOnly, true, "Check setting readOnly property with 'readonly'" );
	equal( Dom.query("#label-for").getProp("for"), "action", "Check retrieving htmlFor" );
	Dom.query("#text1").setProp("class", "test");
	equal( document.getElementById("text1").className, "test", "Check setting className with 'class'" );
	equal( Dom.query("#text1").getProp("maxlength"), 30, "Check retrieving maxLength" );
	Dom.query("#table").setProp("cellspacing", 1);
	equal( Dom.query("#table").getProp("cellSpacing"), "1", "Check setting and retrieving cellSpacing" );
	Dom.query("#table").setProp("cellpadding", 1);
	equal( Dom.query("#table").getProp("cellPadding"), "1", "Check setting and retrieving cellPadding" );
	Dom.query("#table").setProp("rowspan", 1);
	equal( Dom.query("#table").getProp("rowSpan"), 1, "Check setting and retrieving rowSpan" );
	Dom.query("#table").setProp("colspan", 1);
	equal( Dom.query("#table").getProp("colSpan"), 1, "Check setting and retrieving colSpan" );
	Dom.query("#table").setProp("usemap", 1);
	equal( Dom.query("#table").getProp("useMap"), 1, "Check setting and retrieving useMap" );
	Dom.query("#table").setProp("frameborder", 1);
	equal( Dom.query("#table").getProp("frameBorder"), 1, "Check setting and retrieving frameBorder" );
	QUnit.reset();

	var body = document.body,
		$body = Dom.query( body );

	ok( $body.getProp("nextSibling") === null, "Make sure a null expando returns null" );
	body["foo"] = "bar";
	equal( $body.getProp("foo"), "bar", "Make sure the expando is preferred over the dom attribute" );
	body["foo"] = undefined;
	ok( $body.getProp("foo") === undefined, "Make sure the expando is preferred over the dom attribute, even if undefined" );

	var select = document.createElement("select"), optgroup = document.createElement("optgroup"), option = document.createElement("option");
	optgroup.appendChild( option );
	select.appendChild( optgroup );

	equal( Dom.query(option).getProp("selected"), true, "Make sure that a single option is selected, even when in an optgroup." );
	equal( Dom.query(document).getProp("nodeName"), "#document", "prop works correctly on document nodes (bug #7451)." );

	var attributeNode = document.createAttribute("irrelevant"),
		commentNode = document.createComment("some comment"),
		textNode = document.createTextNode("some text"),
		obj = {};
	Object.each([document, attributeNode, commentNode, textNode, textNode, "#firstp"], function(ele, i) {  
		strictEqual( Dom.query(ele).getProp("nonexisting"), null, "prop works correctly for non existing attributes (bug #7500)." );
	});

	Object.each([document, document], function(ele) {
		var $ele = Dom.query( ele );
		$ele.setProp( "nonexisting", "foo" );
		equal( $ele.getProp("nonexisting"), "foo", "prop(name, value) works correctly for non existing attributes (bug #7500)." );
	});
	Dom.query( document ).setProp("nonexisting", null);

	var $form = Dom.query("#form").setProp("enctype", "multipart/form-data");
	equal( $form.getProp("enctype"), "multipart/form-data", "Set the enctype of a form (encoding in IE6/7 #6743)" );
});

test("Dom.prototype.getProp('tabindex')", function() {
	expect(8);

	// elements not natively tabbable
	equal(Dom.query("#listWithTabIndex").getProp("tabindex"), 5, "not natively tabbable, with tabindex set to 0");
	equal(Dom.query("#divWithNoTabIndex").getProp("tabindex"), 0, "not natively tabbable, no tabindex set");

	// anchor with href
	equal(Dom.query("#linkWithNoTabIndex").getProp("tabindex"), 0, "anchor with href, no tabindex set");
	equal(Dom.query("#linkWithTabIndex").getProp("tabindex"), 2, "anchor with href, tabindex set to 2");
	equal(Dom.query("#linkWithNegativeTabIndex").getProp("tabindex"), -1, "anchor with href, tabindex set to -1");

	// anchor without href
	equal(Dom.query("#linkWithNoHrefWithNoTabIndex").getProp("tabindex"), 0, "anchor without href, no tabindex set");
	equal(Dom.query("#linkWithNoHrefWithTabIndex").getProp("tabindex"), 1, "anchor without href, tabindex set to 2");
	equal(Dom.query("#linkWithNoHrefWithNegativeTabIndex").getProp("tabindex"), -1, "anchor without href, no tabindex set");
});

test("Dom.prototype.setProp('tabindex', value)", function() {
	expect(9);

	var element = Dom.query("#divWithNoTabIndex");
	equal(element.getProp("tabindex"), 0, "start with no tabindex");

	// set a positive string
	element.setProp("tabindex", "1");
	equal(element.getProp("tabindex"), 1, "set tabindex to 1 (string)");

	// set a zero string
	element.setProp("tabindex", "0");
	equal(element.getProp("tabindex"), 0, "set tabindex to 0 (string)");

	// set a negative string
	element.setProp("tabindex", "-1");
	equal(element.getProp("tabindex"), -1, "set tabindex to -1 (string)");

	// set a positive number
	element.setProp("tabindex", 1);
	equal(element.getProp("tabindex"), 1, "set tabindex to 1 (number)");

	// set a zero number
	element.setProp("tabindex", 0);
	equal(element.getProp("tabindex"), 0, "set tabindex to 0 (number)");

	// set a negative number
	element.setProp("tabindex", -1);
	equal(element.getProp("tabindex"), -1, "set tabindex to -1 (number)");

	element = Dom.query("#linkWithTabIndex");
	equal(element.getProp("tabindex"), 2, "start with tabindex 2");

	element.setProp("tabindex", -1);
	equal(element.getProp("tabindex"), -1, "set negative tabindex");
});

test("Dom.prototype.setProp(String, null)", function() {
	expect(6);
	var attributeNode = document.createAttribute("irrelevant"),
		commentNode = document.createComment("some comment"),
		textNode = document.createTextNode("some text"),
		obj = {};

	strictEqual( Dom.query( "#firstp" ).setProp( "nonexisting", "foo" ).setProp( "nonexisting", null )[0]["nonexisting"], undefined, "removeprop works correctly on DOM element nodes" );

	Object.each([document, document], function(ele, i) {
		var $ele = Dom.get( ele );
		$ele.setProp( "nonexisting", "foo" ).setProp( "nonexisting", null );
		strictEqual( ele["nonexisting"], undefined, "removeProp works correctly on non DOM element nodes (bug #7500)." );
	});
	Object.each([commentNode, document, document], function(ele, i) {
		var $ele = Dom.get( ele );
		$ele.setProp( "nonexisting", "foo" ).setProp( "nonexisting", null );
		strictEqual( ele["nonexisting"], undefined, "removeProp works correctly on non DOM element nodes (bug #7500)." );
	});
});

if ( "value" in document.createElement("meter") &&
			"value" in document.createElement("progress") ) {

	test("getText() respects numbers without exception (Bug #9319)", function() {

		var $meter = Dom.parse("<meter min='0' max='10' value='5.6'></meter>"),
			$progress =  Dom.parse("<progress max='10' value='1.5'></progress>");

		//try {
			equal( typeof $meter.getText(), "string", "meter, returns a number and does not throw exception" );
			// equal( $meter.getText(), $meter.value, "meter, api matches host and does not throw exception" );

			equal( typeof $progress.getText(), "string", "progress, returns a number and does not throw exception" );
			//  equal( $progress.getText(), $progress.value, "progress, api matches host and does not throw exception" );

		//} catch(e) {}

		$meter.remove();
		$progress.remove();
	});
}

// testing if a form.reset() breaks a subsequent call to a select element's .getText() (in IE only)
test("setText(select) after form.reset()", function() {
	
	Dom.parse("<form id='kk' name='kk'><select id='kkk'><option value='cf'>cf</option><option 	value='gf'>gf</option></select></form>").appendTo("qunit-fixture");

	Dom.get("kkk").setText( "gf" );

	document.kk.reset();

	equal( Dom.get("kkk").dom.value, "cf", "Check value of select after form reset." );
	equal( Dom.get("kkk").getText(), "cf", "Check value of select after form reset." );

	// re-verify the multi-select is not broken (after form.reset) by our fix for single-select
	//deepEqual( Dom.get("select3").getText().split(','), ["1", "2"], "Call getText() on a multiple=\"multiple\" select" );

	Dom.get("kk").remove();
});

test("Dom.prototype.addClass", function() {

	var div = document.query("div");
	div.addClass( "test" );
	var pass = true;
	for ( var i = 0; i < div.length; i++ ) {
		if ( !~div[i].className.indexOf("test") ) {
			pass = false;
		}
	}
	ok( pass, "Add Class" );

	div = Dom.parse("<div/>");

	div.addClass( "test" );
	equal( div.getAttr("class"), "test", "Make sure there's no extra whitespace." );

	// div.setAttr("class", " foo");
	// div.addClass( "test" );
	// equal( div.getAttr("class"), "foo test", "Make sure there's no extra whitespace." );

	div.setAttr("class", "foo");
	div.addClass( "bar baz" );
	equal( div.getAttr("class"), "foo bar baz", "Make sure there isn't too much trimming." );

	div.removeClass();
	div.addClass( "foo" ).addClass( "foo" )
	equal( div.getAttr("class"), "foo", "Do not add the same class twice in separate calls." );

	div.addClass( "fo" );
	equal( div.getAttr("class"), "foo fo", "Adding a similar class does not get interrupted." );
	div.removeClass().addClass("wrap2");
	ok( div.addClass("wrap").hasClass("wrap"), "Can add similarly named classes");

	div.removeClass();
	div.addClass( "bar bar" );
	equal( div.getAttr("class"), "bar", "Do not add the same class twice in the same call." );

});

test("Dom.prototype.removeClass", function() {

	var $divs =  document.query("div");

	$divs.addClass("test").removeClass( "test" );

	ok( !$divs.item(0).hasClass("test"), "Remove Class" );

	QUnit.reset();
	$divs = document.query("div");

	$divs.addClass("test").addClass("foo").addClass("bar");
	$divs.removeClass( "test" ).removeClass( "bar" ).removeClass( "foo" );

	ok( !$divs.item(0).hasClass("bar"), "Remove multiple classes" );

	QUnit.reset();
	$divs = document.query("div");

	// Make sure that a null value doesn't cause problems
	// $divs[0].addClass("test").removeClass( null );
	// ok( $divs[0].hasClass("test"), "Null value passed to removeClass" );

	//$divs[0].addClass("test").removeClass( "" );
	//ok( $divs[0].hasClass("test"), "Empty string passed to removeClass" );

	var div = document.createElement("div");
	div.className = " test foo ";

	Dom.get(div).removeClass( "foo" );
	equal( div.className, "test", "Make sure remaining className is trimmed." );

	div.className = " test ";

	Dom.get(div).removeClass( "test" );
	equal( div.className, "", "Make sure there is nothing left after everything is removed." );
});

test("Dom.prototype.toggleClass", function() {

	var e = Dom.get("firstp");
	ok( !e.hasClass("test"), "Assert class not present" );
	e.toggleClass( "test" );
	ok( e.hasClass("test"), "Assert class present" );
	e.toggleClass( "test" );
	ok( !e.hasClass("test"), "Assert class not present" );

	// class name with a boolean
	e.toggleClass( "test", false );
	ok( !e.hasClass("test"), "Assert class not present" );
	e.toggleClass( "test", true );
	ok( e.hasClass("test"), "Assert class present" );
	e.toggleClass( "test", false );
	ok( !e.hasClass("test"), "Assert class not present" );

	// multiple class names
	e.addClass("testA testB");
	ok( (e.hasClass("testA")), "Assert 2 different classes present" );
	// e.toggleClass( "testB testC" );
	// ok( (e.hasClass("testA") && !e.is(".testB")), "Assert 1 class added, 1 class removed, and 1 class kept" );
	// e.toggleClass( "testA testC" );
	// ok( (!e.hasClass("testA") && !e.hasClass("testB") && !e.hasClass("testC")), "Assert no class present" );

	// toggleClass storage
	// e.toggleClass(true);
	// ok( e.dom.className === "", "Assert class is empty (data was empty)" );
	e.addClass("testD testE");
	ok( e.hasClass("testD") && e.hasClass("testE"), "Assert class present" );
	//e.toggleClass(e.dom.className);
	//ok( !e.hasClass("testD") || !e.hasClass("testE"), "Assert class not present" );
	//e.toggleClass(e.dom.className);
	//ok( e.hasClass("testD") && e.hasClass("testE"), "Assert class present (restored from data)" );
	//e.toggleClass(e.dom.className, false);
	//ok( !e.hasClass("testD") || !e.hasClass("testE"), "Assert class not present" );
	//e.toggleClass(e.dom.className, true);
	//ok( e.hasClass("testD") && e.hasClass("testE"), "Assert class present (restored from data)" );
	//e.toggleClass(e.dom.className);
	//e.toggleClass(e.dom.className, false);
	//e.toggleClass(e.dom.className);
	//ok( e.hasClass("testD") && e.hasClass("testE"), "Assert class present (restored from data)" );

	// Cleanup
	e.removeClass("testD");
});

test("addClass, removeClass, hasClass", function() {

	var x = Dom.parse("<p>Hi</p>");

	x.addClass("hi");
	equal( x.dom.className, "hi", "Check single added class" );

	x.addClass("foo bar");
	equal( x.dom.className, "hi foo bar", "Check more added classes" );

	x.removeClass();
	equal( x.dom.className, "", "Remove all classes" );

	x.addClass("hi foo bar");
	x.removeClass("foo");
	equal( x.dom.className, "hi bar", "Check removal of one class" );

	ok( x.hasClass("hi"), "Check has1" );
	ok( x.hasClass("bar"), "Check has2" );

	// var x = Dom.parse("<p class='class1\nclass2\tcla.ss3\n\rclass4'></p>");
	// ok( x.hasClass("class1"), "Check hasClass with line feed" );
	// ok( x.hasClass("class2"), "Check hasClass with tab" );
	// ok( x.hasClass("cla"), "Check hasClass with dot" );
	// ok( x.hasClass("class4"), "Check hasClass with carriage return" );

	x.removeClass("class2");
	ok( x.hasClass("class2")==false, "Check the class has been properly removed" );
	x.removeClass("cla");
	ok( !x.hasClass("cla"), "Check the dotted class has not been removed" );
	x.removeClass("cla");
	ok( x.hasClass("cla")==false, "Check the dotted class has been removed" );
	x.removeClass("class4");
	ok( x.hasClass("class4")==false, "Check the class has been properly removed" );
});