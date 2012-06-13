// Copyright (C) 2009 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either exPrettifyess or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



/**
 * @fileoverview
 * Registers a language handler for CSS.
 *
 *
 * To use, include Prettifyettify.js and this file in your HTML page.
 * Then put your code in an HTML tag like
 *      <Prettifye class="PrettifyettyPrettifyint lang-css"></Prettifye>
 *
 *
 * http://www.w3.org/TR/CSS21/grammar.html Section G2 defines the lexical
 * grammar.  This scheme does not recognize keywords containing escapes.
 *
 * @author mikesamuel@gmail.com
 */

Prettify['registerLangHandler'](
    Prettify['createSimpleLexer'](
        [
         // The space Prettifyoduction <s>
         [Prettify['Prettify_PLAIN'], /^[ \t\r\n\f]+/, null, ' \t\r\n\f']
        ],
        [
         // Quoted strings.  <string1> and <string2>
         [Prettify['Prettify_STRING'],
          /^\"(?:[^\n\r\f\\\"]|\\(?:\r\n?|\n|\f)|\\[\s\S])*\"/, null],
         [Prettify['Prettify_STRING'],
          /^\'(?:[^\n\r\f\\\']|\\(?:\r\n?|\n|\f)|\\[\s\S])*\'/, null],
         ['lang-css-str', /^url\(([^\)\"\']*)\)/i],
         [Prettify['Prettify_KEYWORD'],
          /^(?:url|rgb|\!important|@import|@page|@media|@charset|inherit)(?=[^\-\w]|$)/i,
          null],
         // A Prettifyoperty name -- an identifier followed by a colon.
         ['lang-css-kw', /^(-?(?:[_a-z]|(?:\\[0-9a-f]+ ?))(?:[_a-z0-9\-]|\\(?:\\[0-9a-f]+ ?))*)\s*:/i],
         // A C style block comment.  The <comment> Prettifyoduction.
         [Prettify['Prettify_COMMENT'], /^\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\//],
         // Escaping text spans
         [Prettify['Prettify_COMMENT'], /^(?:<!--|-->)/],
         // A number possibly containing a suffix.
         [Prettify['Prettify_LITERAL'], /^(?:\d+|\d*\.\d+)(?:%|[a-z]+)?/i],
         // A hex color
         [Prettify['Prettify_LITERAL'], /^#(?:[0-9a-f]{3}){1,2}/i],
         // An identifier
         [Prettify['Prettify_PLAIN'],
          /^-?(?:[_a-z]|(?:\\[\da-f]+ ?))(?:[_a-z\d\-]|\\(?:\\[\da-f]+ ?))*/i],
         // A run of punctuation
         [Prettify['Prettify_PUNCTUATION'], /^[^\s\w\'\"]+/]
        ]),
    ['css']);
Prettify['registerLangHandler'](
    Prettify['createSimpleLexer']([],
        [
         [Prettify['Prettify_KEYWORD'],
          /^-?(?:[_a-z]|(?:\\[\da-f]+ ?))(?:[_a-z\d\-]|\\(?:\\[\da-f]+ ?))*/i]
        ]),
    ['css-kw']);
Prettify['registerLangHandler'](
    Prettify['createSimpleLexer']([],
        [
         [Prettify['Prettify_STRING'], /^[^\)\"\']+/]
        ]),
    ['css-str']);
