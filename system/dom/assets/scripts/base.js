/**
 * @fileOverview 提供最底层的 DOM 辅助函数。
 * @pragma defaultExtends System.Base
 */

// Core - 核心部分
// Parse - 节点解析部分
// Traversing - 节点转移部分
// Manipulation - 节点处理部分
// Style - CSS部分
// Attribute - 属性部分
// Event - 事件部分
// DomReady - 加载部分
// Dimension - 尺寸部分
// Offset - 定位部分

(function(window) {
	
	assert(!window.Dom || window.$ != window.Dom.get, "重复引入 System.Dom.Base 模块。");

	/**
	 * document 简写。
	 * @type Document
	 */
	var document = window.document,
	
		/**
		 * Object 简写。
		 * @type Object
		 */
		Object = window.Object,
	
		/**
		 * Object.extend 简写。
		 * @type Function
		 */
		extend = Object.extend,
	
		/**
		 * 数组原型。
		 * @type Object
		 */
		ap = Array.prototype,
	
		/**
		 * Object.map 缩写。
		 * @type Object
		 */
		map = Object.map,

		/**
		 * System 简写。
		 * @type Object
		 */
		System = window.System,
	
		/**
		 * 指示当前浏览器是否为标签浏览器。
		 */
		isStd = navigator.isStd,
	
		/**
		 * 所有Dom 对象基类。
		 * @class
		 */
		Dom = Class({
			
			/**
			 * 当前Dom 对象实际对应的 HTMLNode 实例。
			 * @type Node
			 * @protected
			 */
			dom: null,
			
			/**
			 * 获取当前类对应的数据字段。
			 * @proteced override
			 * @returns {Object} 一个可存储数据的对象。
			 */
			dataField: function(){
				
				// 由于 IE 6/7 即将退出市场。此处忽略 IE 6/7 内存泄露问题。
				return this.dom.$data || (this.dom.$data = {});
			},
		
			/**
			 * Dom 对象的封装。
			 * @param {Node} dom 封装的元素。
			 */
			constructor: function (dom) {
				assert.isNode(dom, "Dom.prototype.constructor(dom): {dom} 必须是 DOM 节点。");
				this.dom = dom;
			},
		
			/**
			 * 将当前Dom 对象插入到指定父节点，并显示在指定节点之前。
			 * @param {Node} parentNode 渲染的目标。
			 * @param {Node} refNode=null 渲染的位置。
			 * @protected virtual
			 */
			attach: function(parentNode, refNode) {
				assert(parentNode && parentNode.nodeType, 'Dom.prototype.attach(parentNode, refNode): {parentNode} 必须是 DOM 节点。', parentNode);
				assert(refNode === null || refNode.nodeType, 'Dom.prototype.attach(parentNode, refNode): {refNode} 必须是 null 或 DOM 节点 。', refNode);
				parentNode.insertBefore(this.dom, refNode);
			},
		
			/**
			 * 移除节点本身。
			 * @param {Node} parentNode 渲染的目标。
			 * @protected virtual
			 */
			detach: function(parentNode) {
				assert(parentNode && parentNode.removeChild, 'Dom.prototype.detach(parentNode): {parentNode} 必须是 DOM 节点或Dom 对象。', parent);
				parentNode.removeChild(this.dom);
			},
		
			/**
			 * 在当前Dom 对象下插入一个子Dom 对象，并插入到指定位置。
			 * @param {Dom} childControl 要插入的Dom 对象。
			 * @param {Dom} refControl=null 渲染的位置。
			 * @protected
			 */
			insertBefore: function(childControl, refControl) {
				assert(childControl && childControl.attach, 'Dom.prototype.insertBefore(childControl, refControl): {childControl} 必须是Dom 对象。', childControl);
				childControl.attach(this.dom, refControl && refControl.dom || null);
			},
		
			/**
			 * 删除当前Dom 对象的指定子Dom 对象。
			 * @param {Dom} childControl 要插入的Dom 对象。
			 * @protected
			 */
			removeChild: function(childControl) {
				assert(childControl && childControl.detach, 'Dom.prototype.removeChild(childControl): {childControl} 必须是Dom 对象。', childControl);
				childControl.detach(this.dom);
			}
			
		}),
	
		/**
		 * 表示节点的集合。用于批量操作节点。
		 * @class
		 * @extends Array
		 * @remark
		 * DomList 是对元素列表的包装。  DomList 允许快速操作多个节点。 
		 * Dom 的所有方法对 DomList 都有效。
		 */
		DomList = Class({
	
			/**
			 * 获取当前集合的元素个数。
			 * @type {Number}
			 * @property
			 */
			length: 0,

		    /**
			 * 对当前集合的每个节点的 Dom 封装调用其指定属性名的函数，并将返回值放入新的数组返回。
			 * @param {String} fnName 要调用的函数名。
			 * @param {Array} args 调用时的参数数组。
			 * @return {Array} 返回包含执行结果的数组。
			 * @see Array#see
			 */
			invoke: function(fnName, args) {
				assert(args && typeof args.length === 'number', "DomList.prototype.invoke(fnName, args): {args} 必须是数组, 无法省略。", args);
				var r = [];
				assert(Dom.prototype[fnName] && Dom.prototype[fnName].apply, "DomList.prototype.invoke(fnName, args): Dom 不包含方法 {fnName}。", fnName);
				ap.forEach.call(this, function(value) {
					value = new Dom(value);
					r.push(value[fnName].apply(value, args));
				});
				return r;
			},
			
			/**
			 * 初始化 DomList 新实例。
			 * @param {Array/DomList} nodes 用于初始化当前集合的节点集合。
			 * @constructor
			 */
			constructor: function(nodes) {
	
				if(nodes) {

					assert(nodes.length !== undefined, 'DomList.prototype.constructor(nodes): {nodes} 必须是一个 DomList 或 Array 类型的变量。', nodes);
					
					var node;
					
					while(node = nodes[this.length]) {
						this[this.length++] = node.dom || node;	
					}

				}

			},
	
		    /**
			 * 获取当前集合中指定索引的 Dom 封装。
			 * @param {Number} index 要获取的元素索引。如果 *index* 小于 0， 则表示获取倒数 *index* 位置的元素。
			 * @return {Object} 指定位置所在的元素。如果指定索引的值不存在，则返回 undefined。
			 * @remark
			 * 使用 arr.item(-1) 可获取最后一个元素的值。
			 * @see Array#see
			 * @example 
			 * <pre>
		     * [0, 1, 2, 3].item(0);  // 0
		     * [0, 1, 2, 3].item(-1); // 3
		     * [0, 1, 2, 3].item(5);  // undefined
		     * </pre>
			 */
			item: function(index){
				var elem = this[index < 0 ? this.length + index : index];
				return elem ? new Dom(elem) : null;
			},
			
			/**
			 * 将参数节点添加到当前集合。
			 * @param {Node/NodeList/Array/DomList} ... 要增加的内容。
			 * @return this
			 */
			concat: function() {
				for(var args = arguments, i = 0; i < args.length; i++){
					var value = args[i], j = -1;
					if(value){
						if(typeof value.length !== 'number')
							value = [value];
							
						while(++j < value.length)
							this.include(value[j].dom || value[j]);
					}
				}
	
				return this;
			}
	
		}),
	
		/**
		 * 表示一个点。包含 x 坐标和 y 坐标。
		 * @class Point
		 */
		Point = Class({
			
			/**
			 * @field {Number} x X 坐标。
			 */
			
			/**
			 * @field {Number} y Y 坐标。
			 */
	
			/**
			 * 初始化 Point 的新实例。
			 * @param {Number} x X 坐标。
			 * @param {Number} y Y 坐标。
			 * @constructor
			 */
			constructor: function(x, y) {
				this.x = x;
				this.y = y;
			},
			
			/**
			 * 将当前值加上 *p*。
			 * @param {Point} p 值。
			 * @return {Point} this
			 */
			add: function(p) {
				assert(p && 'x' in p && 'y' in p, "Point.prototype.add(p): {p} 必须有 'x' 和 'y' 属性。", p);
				return new Point(this.x + p.x, this.y + p.y);
			},

			/**
			 * 将当前值减去 *p*。
			 * @param {Point} System 值。
			 * @return {Point} this
			 */
			sub: function(p) {
				assert(p && 'x' in p && 'y' in p, "Point.prototype.sub(p): {p} 必须有 'x' 和 'y' 属性。", p);
				return new Point(this.x - p.x, this.y - p.y);
			}
		}),
		
		/**
		 * 用于测试的元素。
		 * @type Element
		 */
		div = document.createElement('DIV'),
	
		/**
		 * 函数 Dom.parseNode使用的新元素缓存。
		 * @type Object
		 */
		cache = {},
		
		/**
		 * 样式表。
		 * @static
		 * @type Object
		 */
		sizeMap = {},
		
		/**
		 * 默认事件。
		 * @type Object
		 * @ignore
		 */
		eventObj = {

			/**
			 * 创建当前事件可用的参数。
			 * @param {Dom} ctrl 事件所有者。
			 * @param {Event} e 事件参数。
			 * @param {Object} target 事件目标。
			 * @return {Event} e 事件参数。
			 */
			trigger: function (ctrl, type, fn, e) {
				ctrl = ctrl.dom;

				// IE 8- 在处理原生事件时肯能出现错误。
				try {
					if (!e || !e.type) {
						e = new Dom.Event(ctrl, type, e);
					}
				} catch (ex) {
					e = new Dom.Event(ctrl, type);
				}

				return fn(e) && (!ctrl[type = 'on' + type] || ctrl[type](e) !== false);
			},

			/**
			 * 添加绑定事件。
			 * @param {Dom} ctrl 事件所有者。
			 * @param {String} type 类型。
			 * @param {Function} fn 函数。
			 */
			add: div.addEventListener ? function (elem, type, fn) {
				elem.dom.addEventListener(type, fn, false);
			} : function (elem, type, fn) {
				elem.dom.attachEvent('on' + type, fn);
			},

			/**
			 * 删除事件。
			 * @param {Object} elem 对象。
			 * @param {String} type 类型。
			 * @param {Function} fn 函数。
			 */
			remove: div.removeEventListener ? function (elem, type, fn) {
				elem.dom.removeEventListener(elem, fn, false);
			} : function (elem, type, fn) {
				elem.dom.detachEvent('on' + type, fn);
			}

		},

		/**
		 * 处理 <div/> 格式标签的正则表达式。
		 * @type RegExp
		 */
		rXhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
		
		/// #if CompactMode
		
		/**
		 * 透明度的正则表达式。
		 * @type RegExp IE8 使用滤镜支持透明度，这个表达式用于获取滤镜内的表示透明度部分的子字符串。
		 */
		rOpacity = /opacity=([^)]*)/,
		
		/// #endif
		
		/**
		 * 是否属性的正则表达式。
		 * @type RegExp
		 */
		rStyle = /-(\w)|float/,
		
		/**
		 * 判断 body 节点的正则表达式。
		 * @type RegExp
		 */
		rBody = /^(?:BODY|HTML|#document)$/i,
		
		/**
		 * 在 Dom.parseNode 和 setHtml 中对 HTML 字符串进行包装用的字符串。
		 * @type Object 部分元素只能属于特定父元素， tagFix 列出这些元素，并使它们正确地添加到父元素中。 IE678
		 *       会忽视第一个标签，所以额外添加一个 div 标签，以保证此类浏览器正常运行。
		 */
		tagFix = {
			$default: isStd ? [1, '', '']: [2, '$<div>', '</div>'],
			option: [2, '<select multiple="multiple">', '</select>'],
			legend: [2, '<fieldset>', '</fieldset>'],
			thead: [2, '<table>', '</table>'],
			tr: [3, '<table><tbody>', '</tbody></table>'],
			td: [4, '<table><tbody><tr>', '</tr></tbody></table>'],
			col: [3, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
			area: [2, '<map>', '</map>']
		},
		
		styleFix = {
			height: 'setHeight',
			width: 'setWidth'
		},
	
		/**
		 * 特殊属性的列表。
		 * @type Object
		 */
		attrFix = {
			innerText: 'innerText' in div ? 'innerText': 'textContent',
			'for': 'htmlFor',
			'class': 'className'
		},
		
		/**
		 * 字符串字段。
		 * @type Object
		 */
		textFix = {
			
		},
		
		/// #if CompactMode
		 
		/**
		 * 获取元素的实际的样式属性。
		 * @param {Element} elem 需要获取属性的节点。
		 * @param {String} name 需要获取的CSS属性名字。
		 * @return {String} 返回样式字符串，肯能是 undefined、 auto 或空字符串。
		 */
		getStyle = window.getComputedStyle ? function(elem, name) {
	
			// getComputedStyle为标准浏览器获取样式。
			assert.isElement(elem, "Dom.getStyle(elem, name): {elem} ~");
	
			// 获取真实的样式owerDocument返回elem所属的文档对象
			// 调用getComputeStyle的方式为(elem,null)
			var computedStyle = elem.ownerDocument.defaultView.getComputedStyle(elem, null);
	
			// 返回 , 在 火狐如果存在 IFrame， 则 computedStyle == null
			// http://drupal.org/node/182569
			return computedStyle ? computedStyle[name]: null;
	
		}: function(elem, name) {
	
			assert.isElement(elem, "Dom.getStyle(elem, name): {elem} ~");
	
			// 特殊样式保存在 styleFix 。
			if( name in styleFix) {
				switch (name) {
					case 'height':
						return elem.offsetHeight === 0 ? 'auto': elem.offsetHeight -  Dom.calc(elem, 'by+py') + 'px';
					case 'width':
						return elem.offsetWidth === 0 ? 'auto': elem.offsetWidth -  Dom.calc(elem, 'bx+px') + 'px';
					case 'opacity':
						return new Dom(elem).getOpacity().toString();
				}
			}
			// currentStyle：IE的样式获取方法,runtimeStyle是获取运行时期的样式。
			// currentStyle是运行时期样式与style属性覆盖之后的样式
			var r = elem.currentStyle;
	
			if(!r)
				return "";
			r = r[name];
	
			// 来自 jQuery
			// 如果返回值不是一个带px的 数字。 转换为像素单位
			if(/^-?\d/.test(r) && !/^-?\d+(?:px)?$/i.test(r)) {
	
				// 保存初始值
				var style = elem.style, left = style.left, rsLeft = elem.runtimeStyle.left;
	
				// 放入值来计算
				elem.runtimeStyle.left = elem.currentStyle.left;
				style.left = name === "fontSize" ? "1em": (r || 0);
				r = style.pixelLeft + "px";
	
				// 回到初始值
				style.left = left;
				elem.runtimeStyle.left = rsLeft;
	
			}
	
			return r;
		},
		
		/// #else
		
		/// getStyle = function (elem, name) {
		///
		/// 	// 获取样式
		/// 	var computedStyle = elem.ownerDocument.defaultView.getComputedStyle(elem, null);
		///
		/// 	// 返回
		/// 	return computedStyle ? computedStyle[ name ]: null;
		///
		/// },
		/// #endif
		
		/**
		 * 获取滚动大小的方法。
		 * @type Function
		 */
		getScroll = function() {
			var elem = this.dom;
			return new Point(elem.scrollLeft, elem.scrollTop);
		},
		
		/**
		 * 获取窗口滚动大小的方法。
		 * @type Function
		 */
		getWindowScroll = 'pageXOffset' in window ? function() {
			var win = this.defaultView;
			return new Point(win.pageXOffset, win.pageYOffset);
		}: getScroll,
		
		/**
		 * 一个返回 true 的函数。
		 */
		returnTrue = Function.from(true),

		/**
		 * float 属性的名字。
		 * @type String
		 */
		styleFloat = 'cssFloat' in div.style ? 'cssFloat': 'styleFloat',
		
		/**
		 * 浏览器使用的真实的 DOMContentLoaded 事件名字。
		 * @type String
		 */
		domReady,
		
		// IE：styleFloat Other：cssFloat

		t,

		pep;
	
	/// #region Dom
	
	/**
	 * @class Dom
	 */
	extend(Dom, {
		
		/**
		 * 根据一个 *id* 或原生节点获取一个 **Dom** 类的实例。
		 * @param {String/Node/Dom/DomList} id 要获取元素的 id 或用于包装成 Dom 对象的任何元素，如是原生的 DOM 节点、原生的 DOM 节点列表数组或已包装过的 Dom 对象。。
	 	 * @return {Dom} 此函数返回是一个 Dom 类型的变量。通过这个变量可以调用所有文档中介绍的 DOM 操作函数。如果无法找到指定的节点，则返回 null 。此函数可简写为 $。
	 	 * @static
	 	 * @example
        <example>
          <desc>找到 id 为 a 的元素。</desc>
          <html>&lt;p id="a"&gt;once&lt;/p&gt; &lt;div&gt;&lt;p&gt;two&lt;/p&gt;&lt;/div&gt; &lt;p&gt;three&lt;/p&gt;</html>
          <code>Dom.get("a");</code>
          <result>{&lt;p id="a"&gt;once&lt;/p&gt;}</result>
        </example>
        <example>
          <desc>返回 id 为 a1 的 DOM 对象</desc>
          <html>&lt;p id="a1"&gt;&lt;/p&gt; &lt;p id="a2"&gt;&lt;/p&gt; </html>
        </example>
        <example>
          <code>Dom.get(document.getElecmentById('a1')) // 等效于 Dom.get('a1')</code>
        </example>
        <example>
          <code>Dom.get(['a1', 'a2']); // 等效于 Dom.get('a1')</code>
        </example>
        <example>
          <code>Dom.get(Dom.get('a1')); // 等效于 Dom.get('a1')</code>
          <result>{&lt;p id="a1"&gt;&lt;/p&gt;}</result>
        </example>
		 */
		get: function(id) {
			
			return typeof id === "string" ?
				(id = document.getElementById(id)) && new Dom(id) :
				id ? 
					id.nodeType ? 
						new Dom(id) :
						id.dom ? 
							id : 
							Dom.get(id[0]) : 
					null;
			
		},
		
		/**
		 * 执行一个 CSS 选择器，返回一个新的 **DomList** 对象。
		 * @param {String/NodeList/DomList/Array/Dom} 用来查找的 CSS 选择器或原生的 DOM 节点列表。
		 * @return {Element} 如果没有对应的节点则返回一个空的 DomList 对象。
	 	 * @static
	 	 * @see DomList
	 	 * @example
	 	 * 找到所有 p 元素。
	 	 * #####HTML:
	 	 * <pre lang="htm" format="none">
	 	 * &lt;p&gt;one&lt;/p&gt; &lt;div&gt;&lt;p&gt;two&lt;/p&gt;&lt;/div&gt; &lt;p&gt;three&lt;/p&gt;
	 	 * </pre>
	 	 * 
	 	 * #####Javascript:
	 	 * <pre>
	 	 * Dom.query("p");
	 	 * </pre>
	 	 * 
	 	 * #####结果:
	 	 * <pre lang="htm" format="none">
	 	 * [  &lt;p&gt;one&lt;/p&gt; ,&lt;p&gt;two&lt;/p&gt;, &lt;p&gt;three&lt;/p&gt;  ]
	 	 * </pre>
	 	 * 
	 	 * <br>
	 	 * 找到所有 p 元素，并且这些元素都必须是 div 元素的子元素。
	 	 * #####HTML:
	 	 * <pre lang="htm" format="none">
	 	 * &lt;p&gt;one&lt;/p&gt; &lt;div&gt;&lt;p&gt;two&lt;/p&gt;&lt;/div&gt; &lt;p&gt;three&lt;/p&gt;</pre>
	 	 * 
	 	 * #####Javascript:
	 	 * <pre>
	 	 * Dom.query("div &gt; p");
	 	 * </pre>
	 	 * 
	 	 * #####结果:
	 	 * <pre lang="htm" format="none">
	 	 * [ &lt;p&gt;two&lt;/p&gt; ]
	 	 * </pre>
         * 
	 	 * <br>
         * 查找所有的单选按钮(即: type 值为 radio 的 input 元素)。
         * <pre>Dom.query("input[type=radio]");</pre>
		 */
		query: function(selector) {
			
			// 如果传入的是字符串，作为选择器处理。
			// 否则作为一个节点处理。
			return selector ? 
				typeof selector === 'string' ? 
					document.query(selector) :
					typeof selector.length === 'number' ? 
						selector instanceof DomList ?
							selector :
							new DomList(selector) :
						new DomList([Dom.get(selector)]) :
				new DomList;
			
		},
		
		/**
		 * 判断一个元素是否符合一个选择器。
	 	 * @static
		 */
		match: function (elem, selector) {
			assert.isString(selector, "Dom.prototype.find(selector): selector ~。");
			
			if(elem.nodeType !== 1)
				return false;
				
			if(!elem.parentNode){
				var div = document.createElement('div');
				div.appendChild(elem);
				try{
					return match(elem, selector);
				} finally {
					div.removeChild(elem);
				}
			}
			return match(elem, selector);
		},

		/**
		 * 根据提供的原始 HTML 标记字符串，解析并动态创建一个节点，并返回这个节点的 Dom 对象包装对象。
		 * @param {String/Node} html 用于动态创建DOM元素的HTML字符串。
		 * @param {Element} ownerDocument=document 创建DOM元素所在的文档。
		 * @param {Boolean} cachable=true 指示是否缓存节点。
		 * @return {Dom} Dom 对象。
	 	 * @static
	 	 * @remark
	 	 * 可以传递一个手写的 HTML 字符串，或者由某些模板引擎或插件创建的字符串，也可以是通过 AJAX 加载过来的字符串。但是在你创建 input 元素的时会有限制，可以参考第二个示例。当然这个字符串可以包含斜杠 (比如一个图像地址)，还有反斜杠。当创建单个元素时，请使用闭合标签或 XHTML 格式。
	 	 * @example
        <example>
          <desc>动态创建一个 div 元素（以及其中的所有内容），并将它追加到 body 元素中。在这个函数的内部，是通过临时创建一个元素，并将这个元素的 innerHTML 属性设置为给定的标记字符串，来实现标记到 DOM 元素转换的。所以，这个函数既有灵活性，也有局限性。</desc>
          <code>Dom.parse("&lt;div&gt;&lt;p&gt;Hello&lt;/p&gt;&lt;/div&gt;").appendTo(document.body);</code>
          <result>[&lt;div&gt;&lt;p&gt;Hello&lt;/p&gt;&lt;/div&gt;]</result>
        </example>
        <example>
          <desc>创建一个 &lt;input&gt; 元素必须同时设定 type 属性。因为微软规定 &lt;input&gt; 元素的 type 只能写一次。</desc>
          <code>// 在 IE 中无效:
Dom.parse("&lt;input&gt;").setAttr("type", "checkbox");
// 在 IE 中有效:
Dom.parse("&lt;input type='checkbox'&gt;");</code>
        </example>
		 */
		parse: function(html, context, cachable) {

			assert.notNull(html, 'Dom.parse(html, context, cachable): {html} ~');

			return html.dom ? html: new Dom(Dom.parseNode(html, context, cachable));
		},
		
		/**
		 * 创建一个指定标签的节点，并返回这个节点的 Dom 对象包装对象。
		 * @param {String} tagName 要创建的节点标签名。
		 * @param {String} className 用于新节点的 CSS 类名。
	 	 * @static
        <example>
          <desc>动态创建一个 div 元素（以及其中的所有内容），并将它追加到 body 元素中。在这个函数的内部，是通过临时创建一个元素，并将这个元素的 innerHTML 属性设置为给定的标记字符串，来实现标记到 DOM 元素转换的。所以，这个函数既有灵活性，也有局限性。</desc>
          <code>Dom.create("div", "cls").appendTo(document.body);</code>
        </example>
        <example>
          <desc>创建一个 div 元素同时设定 class 属性。</desc>
          <code>Dom.create("div", "className");</code>
          <result>{&lt;div class="className"&gt;&lt;/div&gt;}</result>
        </example>
		 */
		create: function(tagName, className) {
			return new Dom(Dom.createNode(tagName, className || ''));
		},
		
		/**
		 * 创建一个节点。
		 * @param {String} tagName 创建的节点的标签名。
		 * @param {String} className 创建的节点的类名。
	 	 * @static
		 */
		createNode: function(tagName, className) {
			assert.isString(tagName, 'Dom.create(tagName, className): {tagName} ~');
			var div = document.createElement(tagName);
			div.className = className;
			return div;
		},
		
		/**
		 * 根据一个 id 获取元素。如果传入的id不是字符串，则直接返回参数。
		 * @param {String/Node/Dom} id 要获取元素的 id 或元素本身。
	 	 * @return {Node} 元素。
	 	 * @static
		 */
		getNode: function (id) {
			return typeof id === "string" ?
				document.getElementById(id) :
				id ? 
					id.nodeType ? 
						id :
						id.dom || Dom.getNode(id[0]) : 
					null;
			
		},

		/**
		 * 解析一个 html 字符串，返回相应的原生节点。
		 * @param {String/Element} html 字符。
		 * @param {Element} context=document 生成节点使用的文档中的任何节点。
		 * @param {Boolean} cachable=true 指示是否缓存节点。
		 * @return {Element/TextNode/DocumentFragment} 元素。
	 	 * @static
		 */
		parseNode: function(html, context, cachable) {

			// 不是 html，直接返回。
			if( typeof html === 'string') {

				var srcHTML = html;

				// 查找是否存在缓存。
				html = cache[srcHTML];
				context = context && context.ownerDocument || document;

				assert(context.createElement, 'Dom.parseNode(html, context, cachable): {context} 必须是 DOM 节点。', context);

				if(html && html.ownerDocument === context) {

					// 复制并返回节点的副本。
					html = html.cloneNode(true);

				} else {

					// 测试查找 HTML 标签。
					var tag = /<([\w:]+)/.exec(srcHTML);
					cachable = cachable !== false;

					if(tag) {

						assert.isString(srcHTML, 'Dom.parseNode(html, context, cachable): {html} ~');
						html = context.createElement("div");

						var wrap = tagFix[tag[1].toLowerCase()] || tagFix.$default;

						html.innerHTML = wrap[1] + srcHTML.trim().replace(rXhtmlTag, "<$1></$2>") + wrap[2];

						// 转到正确的深度。
						// IE 肯能无法正确完成位置标签的处理。
						for( tag = wrap[0]; tag--; )
						html = html.lastChild;

						// 如果解析包含了多个节点。
						if(html.previousSibling) {
							wrap = html.parentNode;

							assert(context.createDocumentFragment, 'Dom.parseNode(html, context, cachable): {context} 必须是 DOM 节点。', context);
							html = context.createDocumentFragment();
							while(wrap.firstChild) {
								html.appendChild(wrap.firstChild);
							}
						}

						assert(html, "Dom.parseNode(html, context, cachable): 无法根据 {html} 创建节点。", srcHTML);

						// 一般使用最后的节点， 如果存在最后的节点，使用父节点。
						// 如果有多节点，则复制到片段对象。
						cachable = cachable && !/<(?:script|object|embed|option|style)/i.test(srcHTML);

					} else {

						// 创建文本节点。
						html = context.createTextNode(srcHTML);
					}

					if(cachable) {
						cache[srcHTML] = html.cloneNode(true);
					}

				}

			}

			return html;

		},
		
		/**
		 * 判断指定节点之后有无存在子节点。
		 * @param {Element} elem 节点。
		 * @param {Element} child 子节点。
		 * @return {Boolean} 如果确实存在子节点，则返回 true ， 否则返回 false 。
	 	 * @static
		 */
		hasChild: div.compareDocumentPosition ? function(elem, child) {
			assert.isNode(elem, "Dom.hasChild(elem, child): {elem} ~");
			assert.isNode(child, "Dom.hasChild(elem, child): {child} ~");
			return !!(elem.compareDocumentPosition(child) & 16);
		}: function(elem, child) {
			assert.isNode(elem, "Dom.hasChild(elem, child): {elem} ~");
			assert.isNode(child, "Dom.hasChild(elem, child): {child} ~");
			while( child = child.parentNode)
				if(elem === child)
					return true;

			return false;
		},
		
		/**
		 * 获取一个元素对应的文本。
		 * @param {Element} elem 元素。
		 * @return {String} 值。对普通节点返回 text 属性。
	 	 * @static
		 */
		getText: function(elem) {

			assert.isNode(elem, "Dom.getText(elem, name): {elem} ~");
			return elem[textFix[elem.nodeName] || attrFix.innerText] || '';
		},

		/**
		 * 获取元素的属性值。
		 * @param {Node} elem 元素。
		 * @param {String} name 要获取的属性名称。
		 * @return {String} 返回属性值。如果元素没有相应属性，则返回 null 。
	 	 * @static
		 */
		getAttr: function(elem, name) {

			assert.isNode(elem, "Dom.getAttr(elem, name): {elem} ~");

			// if(navigator.isSafari && name === 'selected' &&
			// elem.parentNode) { elem.parentNode.selectIndex;
			// if(elem.parentNode.parentNode)
			// elem.parentNode.parentNode.selectIndex; }
			var fix = attrFix[name];

			// 如果是特殊属性，直接返回Property。
			if(fix) {

				if(fix.get)
					return fix.get(elem, name);

				assert(!elem[fix] || !elem[fix].nodeType, "Dom.getAttr(elem, name): 表单内不能存在 {name} 的元素。", name);

				// 如果 这个属性是自定义属性。
				if( fix in elem)
					return elem[fix];
			}

			assert(elem.getAttributeNode, "Dom.getAttr(elem, name): {elem} 不支持 getAttribute。", elem);

			// 获取属性节点，避免 IE 返回属性。
			fix = elem.getAttributeNode(name);

			// 如果不存在节点， name 为 null ，如果不存在节点值， 返回 null。
			return fix && (fix.value || null);

		},
		
		/**
		 * 判断一个节点是否隐藏。
		 * @method isHidden
		 * @return {Boolean} 隐藏返回 true 。
	 	 * @static
		 */
		
		/**
		 * 检查是否含指定类名。
		 * @param {Element} elem 元素。
		 * @param {String} className 类名。
		 * @return {Boolean} 如果存在返回 true。
	 	 * @static
		 */
		hasClass: function(elem, className) {
			assert.isNode(elem, "Dom.hasClass(elem, className): {elem} ~");
			assert(className && (!className.indexOf || !/[\s\r\n]/.test(className)), "Dom.hasClass(elem, className): {className} 不能空，且不允许有空格和换行。");
			return (" " + elem.className + " ").indexOf(" " + className + " ") >= 0;
		},
			
		dataField: function(elem){
			return Dom.prototype.dataField.call({dom: elem});
		},
		
		/**
		 * 特殊属性集合。
		 * @type Object 特殊的属性，在节点复制时不会被复制，因此需要额外复制这些属性内容。
	 	 * @static
		 */
		propFix: {
			INPUT: 'checked',
			OPTION: 'selected',
			TEXTAREA: 'value'
		},
		
		/**
		 * 特殊属性集合。
		 * @property
		 * @type Object
		 * @static
		 * @private
		 */
		attrFix: attrFix,
		
		/**
		 * 获取文本时应使用的属性值。
		 * @private
	 	 * @static
		 */
		textFix: textFix,
		
		/**
		 * 特殊的样式集合。
		 * @property
		 * @type Object
		 * @private
	 	 * @static
		 */
		styleFix: styleFix,
	
		/**
		 * 用于查找所有支持的伪类的函数集合。
		 * @private
	 	 * @static
		 */
		pseudos: {
			
			target : function (elem) {
				var nameOrId = elem.id || elem.name;
				if(!nameOrId) return false;
				var doc = getDocument(elem).defaultView;
				return nameOrId === (doc.defaultView || doc.parentWindow).location.hash.slice(1)
			},
			
			empty: Dom.isEmpty = function(elem) {
				for( elem = elem.firstChild; elem; elem = elem.nextSibling )
					if( elem.nodeType === 1 || elem.nodeType === 3 ) 
						return false;
				return true;
			},
			
			contains: function( elem, args){ 
				return Dom.getText(elem).indexOf(args) >= 0;
			},
			
			/**
			 * 判断一个节点是否隐藏。
			 * @return {Boolean} 隐藏返回 true 。
			 */
			hidden: Dom.isHidden = function(elem) {
				return (elem.style.display || getStyle(elem, 'display')) === 'none';
			},
			visible: function( elem ){ return !Dom.isHidden(elem); },
			
			not: function(elem, args){ return !match(elem, args); },
			has: function(elem, args){ return query(args, new Dom(elem)).length > 0; },
			
			selected: function(elem){ return elem.selected; },
			checked: function(elem){ return elem.checked; },
			enabled: function(elem){ return elem.disabled === false; },
			disabled: function(elem){ return elem.disabled === true; },
			
			input: function(elem){ return /^(input|select|textarea|button)$/i.test(elem.nodeName); },
			
			"nth-child": function(args, oldResult, result){
				var System = Dom.pseudos;
				if(System[args]){
					System[args](null, oldResult, result);	
				} else if(args = oldResult[args - 1])
					result.push(args);
			},
			"first-child": function (args, oldResult, result) {
				if(args = oldResult[0])
					result.push(args);
			},
			"last-child": function (args, oldResult, result) {
				if(args = oldResult[oldResult.length - 1])
					result.push(args);
			},
			"only-child": function(elem){ 
				var p = new Dom(elem.parentNode).first(elem.nodeName);
				return p && p.next(); 
			},
			odd: function(args, oldResult, result){
				var index = 0, elem, t;
				while(elem = oldResult[index++]) {
					if(args){
						result.push(elem);	
					}
				}
			},
			even: function(args, oldResult, result){
				return Dom.pseudos.odd(!args, oldResult, result);
			}
			
		},

		/**
		 * 显示元素的样式。
		 * @static
		 * @type Object
		 */
		displayFix: {
			position: "absolute",
			visibility: "visible",
			display: "block"
		},
		
		/**
		 * 不需要单位的 css 属性。
		 * @static
		 * @type Object
		 */
		styleNumbers: map('fillOpacity fontWeight lineHeight opacity orphans widows zIndex zoom', returnTrue, {}),

		/**
		 * 默认最大的 z-index 。
		 * @property
		 * @type Number
		 * @private
		 * @static
		 */
		zIndex: 10000,
		
		/**
		 * 
	 	 * @static
		 */
		window: new Dom(window),
		
		/**
		 * 
	 	 * @static
		 */
		document: new Dom(document),

		/**
		 * 获取元素的计算样式。
		 * @param {Element} dom 节点。
		 * @param {String} name 名字。
		 * @return {String} 样式。
	 	 * @static
	 	 *  <desc>访问元素的样式属性。</desc>
        <params name="name" type="String">
          <desc>要访问的属性名称</desc>
        </params>
        <example>
          <desc>取得第一个段落的color样式属性的值。</desc>
          <code>Dom.query("p").getStyle("color");</code>
        </example>
		 */
		getStyle: getStyle,

		/**
		 * 读取样式字符串。
		 * @param {Element} elem 元素。
		 * @param {String} name 属性名。必须使用骆驼规则的名字。
		 * @return {String} 字符串。
	 	 * @static
		 */
		styleString: styleString,

		/**
		 * 读取样式数字。
		 * @param {Element} elem 元素。
		 * @param {String} name 属性名。必须使用骆驼规则的名字。
		 * @return {String} 字符串。
		 * @static
		 */
		styleNumber: styleNumber,

		initToggleArgs: function (args) {
			if(typeof args[0] === 'string')
				return args;
			ap.unshift.call(args, 'opacity');
			return args;
		},

		/**
		 * 清空元素的 display 属性。
		 * @param {Element} elem 元素。
	 	 * @static
		 */
		show: function(elem) {
			assert.isElement(elem, "Dom.show(elem): {elem} ~");

			// 普通元素 设置为 空， 因为我们不知道这个元素本来的 display 是 inline 还是 block
			elem.style.display = '';

			// 如果元素的 display 仍然为 none , 说明通过 CSS 实现的隐藏。这里默认将元素恢复为 block。
			if(getStyle(elem, 'display') === 'none')
				elem.style.display = elem.style.$display || 'block';
		},
		
		/**
		 * 赋予元素的 display 属性 none。
		 * @param {Element} elem 元素。
	 	 * @static
		 */
		hide: function(elem) {
			assert.isElement(elem, "Dom.hide(elem): {elem} ~");
			var currentDisplay = styleString(elem, 'display');
			if(currentDisplay !== 'none') {
				elem.style.$display = currentDisplay;
				elem.style.display = 'none';
			}
		},
		
		/**
		 * 根据不同的内容进行计算。
		 * @param {Element} elem 元素。
		 * @param {String} type 输入。 一个 type
		 *            由多个句子用,连接，一个句子由多个词语用+连接，一个词语由两个字组成， 第一个字可以是下列字符之一:
		 *            m b System t l r b h w 第二个字可以是下列字符之一: x y l t b r
		 *            b。词语也可以是: outer inner 。
		 * @return {Number} 计算值。 mx+sx -> 外大小。 mx-sx -> 内大小。
	 	 * @static
		 */
		calc: (function() {

			var borders = {
				m: 'margin#',
				b: 'border#Width',
				p: 'padding#'
			}, map = {
				t: 'Top',
				r: 'Right',
				b: 'Bottom',
				l: 'Left'
			}, init, tpl;

			if(window.getComputedStyle) {
				init = 'var c=e.ownerDocument.defaultView.getComputedStyle(e,null);return ';
				tpl = '(parseFloat(c["#"]) || 0)';
			} else {
				init = 'return ';
				tpl = '(parseFloat(Dom.getStyle(e, "#")) || 0)';
			}

			/**
			 * 翻译 type。
			 * @param {String} type 输入字符串。
			 * @return {String} 处理后的字符串。
			 */
			function format(type) {
				var t, f = type.charAt(0);
				switch (type.length) {

					case 2:
						t = type.charAt(1);
						assert( f in borders || f === 's', "Dom.calc(e, type): {type} 中的 " + type + " 不合法", type);
						if( t in map) {
							t = borders[f].replace('#', map[t]);
						} else {
							return f === 's' ? 'e.offset' + (t === 'x' ? 'Width': 'Height'): '(' + format(f + (t !== 'y' ? 'l': 't')) + '+' + format(f + (t === 'x' ? 'r': 'b')) + ')';
						}

						break;

					case 1:
						if( f in map) {
							t = map[f].toLowerCase();
						} else if(f !== 'x' && f !== 'y') {
							assert(f === 'h' || f === 'w', "Dom.calc(e, type): {type} 中的 " + type + " 不合法", type);
							return 'Dom.styleNumber(e,"' + (f === 'h' ? 'height': 'width') + '")';
						} else {
							return f;
						}

						break;

					default:
						t = type;
				}

				return tpl.replace('#', t);
			}

			return function(elem, type) {
				assert.isElement(elem, "Dom.calc(elem, type): {elem} ~");
				assert.isString(type, "Dom.calc(elem, type): {type} ~");
				return (sizeMap[type] || (sizeMap[type] = new Function("e", init + type.replace(/\w+/g, format))))(elem);
			}
		})(),

		/**
		 * 设置一个元素可拖动。
		 * @param {Element} elem 要设置的节点。
	 	 * @static
		 */
		movable: function(elem) {
			assert.isElement(elem, "Dom.movable(elem): 参数 elem ~");
			if(!/^(?:abs|fix)/.test(styleString(elem, "position")))
				elem.style.position = "relative";
		},
		
		/**
		 * 获取元素的文档。
		 * @param {Element} elem 元素。
		 * @return {Document} 文档。
	 	 * @static
		 */
		getDocument: getDocument,
	
		/**
		 * 将一个成员附加到 Dom 对象和相关类。
		 * @param {Object} obj 要附加的对象。
		 * @param {Number} listType = 1 说明如何复制到 DomList 实例。
		 * @return this
		 * @static
		 * 对 Element 扩展，内部对 Element DomList document 皆扩展。
		 *         这是由于不同的函数需用不同的方法扩展，必须指明扩展类型。 所谓的扩展，即一个类所需要的函数。 DOM 方法
		 *         有 以下种 1, 其它 setText - 执行结果返回 this， 返回 this 。(默认) 2
		 *         getText - 执行结果是数据，返回结果数组。 3 getElementById - 执行结果是DOM
		 *         或 ElementList，返回 DomList 包装。 4 hasClass -
		 *         只要有一个返回等于 true 的值， 就返回这个值。 参数 copyIf 仅内部使用。
		 */
		implement: function(members, listType, copyIf) {
			assert.notNull(members, "Dom.implement" + ( copyIf ? 'If' : '') + "(members, listType): {members} ~");
		
			Object.each(members, function(value, func) {
		
				var i = this.length;
				while(i--) {
					var cls = this[i].prototype;
					if(!copyIf || !cls[func]) {
		
						if(!i) {
							switch (listType) {
								case 2:
									// return array
									value = function() {
										return this.invoke(func, arguments);
									};
									break;
		
								case 3:
									// return DomList
									value = function() {
										var r = new DomList;
										return r.concat.apply(r, this.invoke(func, arguments));
									};
									break;
								case 4:
									// return if true
									value = function() {
										var i = -1, item = null, target = new Dom();
										while(++i < this.length && !item) {
											target.dom = this[i];
											item = target[func].apply(target, arguments);
										}
										return item;
									};
									break;
								default:
									// return this
									value = function() {
										var len = this.length, i = -1, target;
										while(++i < len) {
											target = new Dom(this[i]);
											target[func].apply(target, arguments);
										}
										return this;
									};
							}
						}
		
						cls[func] = value;
					}
				}
		
			}, [DomList, Dom.Document, Dom]);
		
			return this;

		},
	
		/**
		 * 若不存在，则将一个对象附加到 Element 对象。
		 * @static
		 * @param {Object} obj 要附加的对象。
		 * @param {Number} listType = 1 说明如何复制到 DomList 实例。
		 * @param {Number} docType 说明如何复制到 Document 实例。
		 * @return this
		 */
		implementIf: function(obj, listType) {
			return this.implement(obj, listType, true);
		},
	
		/**
		 * 将指定名字的方法委托到当前对象指定的成员。
		 * @param {Object} Dom 类。
		 * @param {String} delegate 委托变量。
		 * @param {String} methods 所有成员名。
		 *            因此经常需要将一个函数转换为对节点的调用。
		 * @static
		 */
		define: function(ctrl, target, setters, getters) {
			assert(ctrl && ctrl.prototype, "Dom.define(ctrl, target, setters, getters): {ctrl} 必须是一个类", ctrl);
			
			if(typeof getters === 'string'){
				Dom.define(ctrl, target, getters, true);
				getters = 0;
			}
			
			map(setters, function(func) {
				ctrl.prototype[func] = getters ? function(args1, args2) {
					return this[target][func](args1, args2);
				} : function(args1, args2) {
					this[target][func](args1, args2);
					return this;
				};
			});
			return Dom.define;
		},

		/**
		 * 表示事件的参数。
		 * @class Dom.Event
		 */
		Event: Class({

			/**
			 * 构造函数。
			 * @param {Object} target 事件对象的目标。
			 * @param {String} type 事件对象的类型。
			 * @param {Object} [e] 事件对象的属性。
			 * @constructor
			 */
			constructor: function(target, type, e) {
				assert.notNull(target, "Dom.Event.prototype.constructor(target, type, e): {target} ~");

				var me = this;
				me.target = target;
				me.type = type;
				extend(me, e);
			},
			
			/**
			 * 阻止事件的冒泡。
			 * @remark 默认情况下，事件会向父元素冒泡。使用此函数阻止事件冒泡。
			 */
			stopPropagation: function() {
				this.cancelBubble = true;
			},
			
			/**
			 * 取消默认事件发生。
			 * @remark 有些事件会有默认行为，如点击链接之后执行跳转，使用此函数阻止这些默认行为。
			 */
			preventDefault: function() {
				this.returnValue = false;
			},
			
			/**
			 * 停止默认事件和冒泡。
			 * @remark 此函数可以完全撤销事件。 事件处理函数中 return false 和调用 stop() 是不同的， return
			 *         false 只会阻止当前事件其它函数执行， 而 stop() 只阻止事件冒泡和默认事件，不阻止当前事件其它函数。
			 */
			stop: function() {
				this.stopPropagation();
				this.preventDefault();
			},
			
			/**
			 * 获取当前发生事件的Dom 对象。
			 * @return {Dom} 发生事件的Dom 对象。
			 */
			getTarget: function() {
				assert(this.target, "Dom.Event.prototype.getTarget(): 当前事件不支持 getTarget 操作");
				return new Dom(this.target.nodeType === 3 ? this.target.parentNode: this.target);
			}
		}),

		/**
		 * 文档对象。
		 * @constructor Dom.Document 
		 * @extends Dom
		 * @remark 因为 IE6/7 不存在这些对象, 文档对象是对原生 HTMLDocument 对象的补充。 扩展
		 *        Document 也会扩展 HTMLDocument。
		 */
		Document: System.Native(document.constructor || {
			prototype: document
		})

	})
	
	/**@class Dom*/
	
	.implement({
	
		/**
		 * 将当前节点添加到其它节点。
		 * @param {Element/String} elem=document.body 节点、Dom 对象或节点的 id 字符串。
		 * @return this 
		 * this.appendTo(parent) 相当于 parent.append(this) 。 
		 * <desc>把所有匹配的元素追加到文档中。</desc>
        <longdesc>实际上，使用这个方法是颠倒了常规的Dom.query(A).append(B)的操作，即不是把B追加到A中，而是把A追加到B中。</longdesc>
        <example>
          <desc>把所有段落追加到ID值为foo的元素中。</desc>
          <html>&lt;p&gt;I would like to say: &lt;/p&gt;&lt;div id="foo"&gt;&lt;/div&gt;</html>
          <code>Dom.query("p").appendTo();</code>
        </example>
        <desc>把所有匹配的元素追加到另一个、指定的元素元素集合中。</desc>
        <longdesc>实际上，使用这个方法是颠倒了常规的Dom.query(A).append(B)的操作，即不是把B追加到A中，而是把A追加到B中。</longdesc>
        <params name="content" type="String">
          <desc>用于被追加的内容</desc>
        </params>
        <example>
          <desc>把所有段落追加到ID值为foo的元素中。</desc>
          <html>&lt;p&gt;I would like to say: &lt;/p&gt;&lt;div id="foo"&gt;&lt;/div&gt;</html>
          <code>Dom.query("p").appendTo("foo");</code>
          <result>&lt;div id="foo"&gt;&lt;p&gt;I would like to say: &lt;/p&gt;&lt;/div&gt;</result>
        </example>
		 */
		appendTo: function(parent) {
		
			// parent 肯能为 true
			parent && parent !== true ? (parent.append ? parent : Dom.get(parent)).append(this) : this.attach(document.body, null);

			return this;
	
		},
	
		/**
		 * 删除元素子节点或本身。
		 * @param {Dom} childControl 子Dom 对象。
		 * @return {Dom} this
		 * <desc>从DOM中删除所有匹配的元素。</desc>
        <longdesc>这个方法不会把匹配的元素从JPlus对象中删除，因而可以在将来再使用这些匹配的元素。但除了这个元素本身得以保留之外，其他的比如绑定的事件，附加的数据等都会被移除。</longdesc>
        <params name="child" type="String" optional="true">
          <desc>删除的子节点。</desc>
        </params>
        <example>
          <desc>从DOM中把所有段落删除</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt; how are &lt;p&gt;you?&lt;/p&gt;</html>
          <code>Dom.query("p").remove();</code>
          <result>how are</result>
        </example>
        <example>
          <desc>从DOM中把带有hello类的段落删除</desc>
          <html>&lt;p class="hello"&gt;Hello&lt;/p&gt; how are &lt;p&gt;you?&lt;/p&gt;</html>
          <code>Dom.query("p").remove(".hello");</code>
          <result>how are &lt;p&gt;you?&lt;/p&gt;</result>
        </example>
		 */
		remove: function(childControl) {
	
			if (arguments.length) {
				assert(childControl && this.hasChild(childControl), 'Dom.prototype.remove(childControl): {childControl} 不是当前节点的子节点', childControl);
				this.removeChild(childControl);
			} else if (childControl = this.parentControl || this.parent()){
				childControl.removeChild(this);
			}
	
			return this;
		},
	
		/**
	 	 * 删除一个节点的所有子节点。
		 * @return this
		 * <desc>删除匹配的元素集合中所有的子节点。</desc>
        <example>
          <desc>把所有段落的子元素（包括文本节点）删除</desc>
          <html>&lt;p&gt;Hello, &lt;span&gt;Person&lt;/span&gt; &lt;a href="#"&gt;and person&lt;/a&gt;&lt;/p&gt;</html>
          <code>Dom.query("p").empty();</code>
          <result>&lt;p&gt;&lt;/p&gt;</result>
        </example>
		 */
		empty: function() {
			var elem = this.dom;
			if(elem.nodeType == 1)
				Object.each(elem.getElementsByTagName("*"), clean);
			while (elem = this.last(true))
				this.removeChild(elem);
			return this;
		},
	
		/**
		 * 释放节点所有资源。
		 * <desc>从DOM中删除所有匹配的元素。</desc>
        <longdesc>这个方法不会把匹配的元素从JPlus对象中删除，因而可以在将来再使用这些匹配的元素。与remove()不同的是，所有绑定的事件、附加的数据等都会保留下来。</longdesc>
        <params name="expr" type="String" optional="true">
          <desc>用于筛选元素的JPlus表达式</desc>
        </params>
        <example>
          <desc>从DOM中把所有段落删除</desc>
          <html>&lt;p&gt;dispose&lt;/p&gt; how are &lt;p&gt;you?&lt;/p&gt;</html>
          <code>Dom.query("p").detach();</code>
          <result>how are</result>
        </example>
        <example>
          <desc>从DOM中把带有hello类的段落删除</desc>
          <html>&lt;p class="hello"&gt;Hello&lt;/p&gt; how are &lt;p&gt;you?&lt;/p&gt;</html>
          <code>Dom.query("p").dispose(".hello");</code>
        </example>
		 */
		dispose: function() {
			if(this.dom.nodeType == 1){
				Object.each(this.dom.getElementsByTagName("*"), clean)
				clean(this.dom);
			}
			
			this.remove();
		},
	
		/**
		 * 设置一个样式属性的值。
		 * @param {String} name CSS 属性名或 CSS 字符串。
		 * @param {String/Number} [value] CSS属性值， 数字如果不加单位，则函数会自动追为像素。
		 * @return this
		 * <desc>把一个“名/值对”对象设置为所有匹配元素的样式属性。</desc>
        <longdesc>这是一种在所有匹配的元素上设置大量样式属性的最佳方式。</longdesc>
        <params name="key" type="String">
          <desc>属性名称</desc>
        </params>
        <params name="value" type="Object">
          <desc>属性值</desc>
        </params>
        <example>
          <desc>将所有段落的字体颜色设为红色并且背景为蓝色。</desc>
          <code>Dom.query("p").setStyle('color', "#ff0011");</code>
        </example>
		 */
		setStyle: function(name, value) {
		
			// 获取样式
			var me = this;
			
			assert.isString(name, "Dom.prototype.setStyle(name, value): {name} ~");
			assert.isElement(me.dom, "Dom.prototype.setStyle(name, value): 当前 dom 不支持样式");
		
			// 设置通用的属性。
			if(arguments.length == 1){
				me.dom.style.cssText += ';' + name;
				
			// 特殊的属性值。
			} else if( name in styleFix) {
		
				// setHeight setWidth setOpacity
				return me[styleFix[name]](value);
		
			} else {
				name = name.replace(rStyle, formatStyle);
		
				assert(value || !isNaN(value), "Dom.prototype.setStyle(name, value): {value} 不是正确的属性值。", value);
		
				// 如果值是函数，运行。
				if( typeof value === "number" && !( name in Dom.styleNumbers))
					value += "px";
		
			}
		
			// 指定值。
			me.dom.style[name] = value;
		
			return me;

		},
	
		/**
		 * 设置连接的透明度。
		 * @param {Number} value 透明度， 0 - 1 。
		 * @return this
		 */
		setOpacity: 'opacity' in div.style ? function(value) {
		
			assert(value <= 1 && value >= 0, 'Dom.prototype.setOpacity(value): {value} 必须在 0~1 间。', value);
			assert.isElement(this.dom, "Dom.prototype.setStyle(name, value): 当前 dom 不支持样式");
		
			// 标准浏览器使用 opacity
			this.dom.style.opacity = value;
			return this;
		
		}: function(value) {
			var elem = this.dom, style = elem.style;
		
			assert(!+value || (value <= 1 && value >= 0), 'Dom.prototype.setOpacity(value): {value} 必须在 0~1 间。', value);
			assert.isElement(elem, "Dom.prototype.setStyle(name, value): 当前 dom 不支持样式");
		
			if(value)
				value *= 100;
			value = value || value === 0 ? 'opacity=' + value : '';
		
			// 获取真实的滤镜。
			elem = styleString(elem, 'filter');
		
			assert(!/alpha\([^)]*\)/i.test(elem) || rOpacity.test(elem), 'Dom.prototype.setOpacity(value): 当前元素的 {filter} CSS属性存在不属于 alpha 的 opacity， 将导致 setOpacity 不能正常工作。', elem);
		
			// 当元素未布局，IE会设置失败，强制使生效。
			style.zoom = 1;
		
			// 设置值。
			style.filter = rOpacity.test(elem) ? elem.replace(rOpacity, value) : (elem + ' alpha(' + value + ')');
		
			return this;

		},
	
		/// #else
		
		/// setOpacity: function (value) {
		///
		/// 	assert(value <= 1 && value >= 0,
		//   'Dom.prototype.setOpacity(value): {value} 必须在 0~1 间。',
		//    value);
		///
		/// 	// 标准浏览器使用 opacity
		/// 	(this.dom).style.opacity = value;
		/// 	return this;
		///
		/// },
		
		/// #endif
		
		/**
		 * 显示当前元素。
		 * @param {Number} duration=500 时间。
		 * @param {Function} [callBack] 回调。
		 * @param {String} [type] 方式。
		 * @return this
		 */
		show: function () {
			var args = Dom.initToggleArgs(arguments);
			Dom.show(this.dom);
			if (args = args[2]) setTimeout(args, 0);
			return this;
		},
	
		/**
		 * 隐藏当前元素。
		 * @param {Number} duration=500 时间。
		 * @param {Function} [callBack] 回调。
		 * @param {String} [type] 方式。
		 * @return this
		 */
		hide: function (duration, callback) {
			var args = Dom.initToggleArgs(arguments);
			Dom.hide(this.dom);
			if (args = args[2]) setTimeout(args, 0);
			return this;
		},
	
		/**
		 * 切换显示当前元素。
		 * @param {Number} duration=500 时间。
		 * @param {Function} [callBack] 回调。
		 * @param {String} [type] 方式。
		 * @return this
		 */
		toggle: function () {
			var args = Dom.initToggleArgs(arguments);
			return this[(args[4] === undefined ? Dom.isHidden(this.dom) : args[4]) ? 'show' : 'hide'].apply(this, args);
		},
	
		/**
		 * 设置元素不可选。
		 * @param {Boolean} value 是否可选。
		 * @return this
		 */
		unselectable: 'unselectable' in div ? function(value) {
			assert.isElement(this.dom, "Dom.prototype.unselectable(value): 当前 dom 不支持此操作");
			this.dom.unselectable = value !== false ? 'on': '';
			return this;
		}: 'onselectstart' in div ? function(value) {
			assert.isElement(this.dom, "Dom.prototype.unselectable(value): 当前 dom 不支持此操作");
			this.dom.onselectstart = value !== false ? Function.from(false): null;
			return this;
		}: function(value) {
			assert.isElement(this.dom, "Dom.prototype.unselectable(value): 当前 dom 不支持此操作");
			this.dom.style.MozUserSelect = value !== false ? 'none': '';
			return this;
		},
	
		/**
		 * 将元素引到最前。
		 * @param {Dom} [targetControl] 如果指定了参考Dom 对象，则Dom 对象将位于指定的Dom 对象之上。
		 * @return this
		 */
		bringToFront: function(targetControl) {
			assert(!targetControl || (targetControl.dom && targetControl.dom.style), "Dom.prototype.bringToFront(elem): {elem} 必须为 空或允许使用样式的Dom 对象。", targetControl);
		
			var thisElem = this.dom, targetZIndex = targetControl&& (parseInt(styleString(targetControl.dom, 'zIndex')) + 1) || Dom.zIndex++;
		
			// 如果当前元素的 z-index 未超过目标值，则设置
			if(!(styleString(thisElem, 'zIndex') > targetZIndex))
				thisElem.style.zIndex = targetZIndex;
		
			return this;

		}, 
		
		/**
		 * 设置一个属性值。
		 * @param {String} name 要设置的属性名称。
		 * @param {String} value 要设置的属性值。当设置为 null 时，删除属性。
		 * @return this
        <example>
          <desc>为所有图像设置src属性。</desc>
          <html>&lt;img/&gt;
&lt;img/&gt;</html>
          <code>Dom.query("img").setAttr("src","test.jpg");</code>
          <result>[ &lt;img src= "test.jpg" /&gt; , &lt;img src= "test.jpg" /&gt; ]</result>
        </example>
        <example>
          <desc>将文档中图像的src属性删除</desc>
          <html>&lt;img src="test.jpg"/&gt;</html>
          <code>Dom.query("img").setAttr("src");</code>
          <result>[ &lt;img /&gt; ]</result>
        </example>
		 */
		setAttr: function(name, value) {
			var elem = this.dom;
		
			/// #if CompactMode
			
			assert(name !== 'type' || elem.tagName !== "INPUT" || !elem.parentNode, "Dom.prototype.setAttr(name, type): 无法修改INPUT元素的 type 属性。");
		
			/// #endif
			// 如果是节点具有的属性。
			if( name in attrFix) {
		
				if(attrFix[name].set)
					attrFix[name].set(elem, name, value);
				else {
		
					assert(elem.tagName !== 'FORM' || name !== 'className' || typeof elem.className === 'string', "Dom.prototype.setAttr(name, type): 表单内不能存在 name='className' 的节点。");
		
					elem[attrFix[name]] = value;
		
				}
		
			} else if(value === null) {
		
				assert(elem.removeAttributeNode, "Dom.prototype.setAttr(name, type): 当前元素不存在 removeAttributeNode 方法");
		
				if( value = elem.getAttributeNode(name)) {
					value.nodeValue = '';
					elem.removeAttributeNode(value);
				}
		
			} else {
		
				assert(elem.getAttributeNode, "Dom.prototype.setAttr(name, type): 当前元素不存在 getAttributeNode 方法");
		
				var node = elem.getAttributeNode(name);
		
				if(node)
					node.nodeValue = value;
				else
					elem.setAttribute(name, value);
		
			}
		
			return this;

		},
	
		/**
		 * 快速设置一个元素的样式、属性或事件。
		 * @param {String/Object} name 属性名。可以是一个 css 属性名或 html 属性名。如果属性名是on开头的，则被认为是绑定事件。 - 或 - 属性值，表示 属性名/属性值 的 JSON 对象。
		 * @param {Object} [value] 属性值。
		 * @return this
		 * @remark
		 * 此函数相当于调用 setStyle 或 setAttr 。数字将自动转化为像素值。
        <example>
          <desc>将所有段落字体设为红色、设置 class 属性、绑定 click 事件。</desc>
          <code>Dom.query("p").set("color","red").set("class","cls-red").set("onclick", function(){alert('clicked')});</code>
        </example>
        <example>
          <desc>将所有段落字体设为红色、设置 class 属性、绑定 click 事件。</desc>
          <code>Dom.query("p").set({
  "color":"red",
  "class":"cls-red",
  "onclick": function(){alert('clicked')}
});</code>
        </example>
		 */
		set: function(name, value) {
			var me = this;
		
			if( typeof name === "string") {
		
				var elem = me.dom;
		
				// event 。
				if(name.match(/^on(\w+)/))
					me.on(RegExp.$1, value);
		
				// css 。
				else if(elem.style && ( name in elem.style || rStyle.test(name)))
					me.setStyle(name, value);
		
				// attr 。
				else
					me.setAttr(name, value);
		
			} else if(Object.isObject(name)) {
		
				for(value in name)
					me.set(value, name[value]);
		
			}
		
			return me;

		},
	
		/**
		 * 为元素添加指定的类名。
		 * @param {String} className 一个或多个要添加到元素中的CSS类名，用空格分开。
		 * @return this
        <example>
          <desc>为匹配的元素加上 'selected' 类</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;</html>
          <code>Dom.query("p").addClass("selected");</code>
          <result>[ &lt;p class="selected"&gt;Hello&lt;/p&gt; ]</result>
        </example>
        <example>
          <desc>为匹配的元素加上 selected highlight 类</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;</html>
          <code>Dom.query("p").addClass("selected highlight");</code>
          <result>[ &lt;p class="selected highlight"&gt;Hello&lt;/p&gt; ]</result>
        </example>
		 */
		addClass: function(className) {
			assert.isString(className, "Dom.prototype.addClass(className): {className} ~");
		
			var elem = this.dom, classList = className.split(/\s+/), newClass, i;
		
			if(!elem.className && classList.length <= 1) {
				elem.className = className;
		
			} else {
				newClass = " " + elem.className + " ";
		
				for( i = 0; i < classList.length; i++) {
					if(newClass.indexOf(" " + classList[i] + " ") < 0) {
						newClass += classList[i] + " ";
					}
				}
				elem.className = newClass.trim();
			}
		
			return this;

		},
	
		/**
		 * 从元素中删除全部或者指定的类。
		 * @param {String} [className] 一个或多个要删除的CSS类名，用空格分开。如果不提供此参数，将清空 className 。
		 * @return this
		 * 
        <example>
          <desc>从匹配的元素中删除 'selected' 类</desc>
          <html>&lt;p class="selected first"&gt;Hello&lt;/p&gt;</html>
          <code>Dom.query("p").removeClass("selected");</code>
          <result>[ &lt;p class="first"&gt;Hello&lt;/p&gt; ]</result>
        </example>
		 * */
		removeClass: function(className) {
			assert(!className || className.split, "Dom.prototype.removeClass(className): {className} ~");
		
			var elem = this.dom, classList, newClass = "", i;
		
			if(className) {
				classList = className.split(/\s+/);
				newClass = " " + elem.className + " ";
				for( i = classList.length; i--; ) {
					newClass = newClass.replace(" " + classList[i] + " ", " ");
				}
				newClass = newClass.trim();
		
			}
		
			elem.className = newClass;
		
			return this;

		},
	
		/**
		 * 如果存在（不存在）就删除（添加）一个类。
		 * @param {String} className CSS类名。
		 * @param {Boolean} [toggle] 自定义切换的方式。如果为 true， 则加上类名，否则删除。
		 * @return this
        <example>
          <desc>为匹配的元素切换 'selected' 类</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p class="selected"&gt;Hello Again&lt;/p&gt;</html>
          <code>Dom.query("p").toggleClass("selected");</code>
          <result>[ &lt;p class="selected"&gt;Hello&lt;/p&gt;, &lt;p&gt;Hello Again&lt;/p&gt; ]</result>
        </example>
		 */
		toggleClass: function(className, stateVal) {
			return (stateVal !== undefined ? !stateVal: this.hasClass(className)) ? this.removeClass(className): this.addClass(className);
		},
	
		/**
		 * 设置元素的文本内容。对于输入框则设置其输入的值。
		 * @param {String} 用于设置元素内容的文本。
		 * @return this
		 * @remark 与 {@link #setHtml} 类似, 但将编码 HTML (将 "&lt;" 和 "&gt;" 替换成相应的HTML实体)。
        <example>
          <desc>设定文本框的值</desc>
          <html>&lt;input type="text"/&gt;</html>
          <code>Dom.query("input").setText("hello world!");</code>
        </example>
		 */
		setText: function(value) {
			var elem = this.dom;
			elem[textFix[elem.nodeName] || attrFix.innerText] = value;
			return this;
		},
	
		/**
		 * 设置元素的html内容。
		 * @param {String} value 用于设定HTML内容的值。
		 * @return this
        <example>
          <desc>设置一个节点的内部 html </desc>
          <html>&lt;div id="a"&gt;&lt;p/&gt;&lt;/div&gt;</html>
          <code>Dom.get("a").setHtml("&lt;a/&gt;");</code>
          <result>&lt;div id="a"&gt;&lt;a/&gt;&lt;/div&gt;</result>
        </example>
		 */
		setHtml: function(value) {
			var elem = this.dom,
				map = tagFix.$default;
			
			assert(elem.nodeType === 1, "Dom.prototype.setHtml(value): 仅当 dom.nodeType === 1 时才能使用此函数。"); 
			
			value = (map[1] + value + map[2]).replace(rXhtmlTag, "<$1></$2>");
			// Object.each(elem.getElementsByTagName("*"), function(node){
			// 	node.$data = null;
			// });
			
			try {
				elem.innerHTML = value;
				
			// 如果 innerHTML 出现错误，则直接使用节点方式操作。
			} catch(e){
				this.empty().append(value);
				return this;
			}
			if (map[0] > 1) {
				value = elem.lastChild;
				elem.removeChild(elem.firstChild);
				elem.removeChild(value);
				while (value.firstChild)
					elem.appendChild(value.firstChild);
			}
	
			return this;
		},

		/**
		 * 改变大小。
		 * @param {Number} x 坐标。
		 * @param {Number} y 坐标。
		 * @return this
		 *  <desc>设置元素实际占用大小（包括内边距和边框，但不包括滚动区域之外的大小）。</desc>
        <longdesc>此方法对可见和隐藏元素均有效。</longdesc>
        <params name="coordinates" type="Object{width,height}, function(index, coords) ">
          <desc>一个对象，包含x和y属性，作为元素的新宽度和高度。函数接受两个参数，第一个参数是元素在原先集合中的索引位置，第二个参数为原先的宽度。</desc>
        </params>
        <example>
          <desc>设置第一段落的大小。</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;</html>
          <code>Dom.query("p:first").setSize({x:200,y:100});</code>
        </example>
		 */
		setSize: function(x, y) {
			var me = this,
			System = formatPoint(x, y);
		
			if (System.x != null) me.setWidth(System.x - Dom.calc(me.dom, 'bx+px'));
		
			if (System.y != null) me.setHeight(System.y - Dom.calc(me.dom, 'by+py'));
		
			return me;
		},
	
		/**
		 * 获取元素自身大小（不带滚动条）。
		 * @param {Number} value 值。
		 * @return this
		 *  <desc>为元素设置CSS宽度(width)属性的值。</desc>
        <longdesc>如果没有明确指定单位（如：em或%），使用px。</longdesc>
        <params name="val" type="String, Number, Function">
          <desc>设定 CSS 'width' 的属性值，可以是字符串或者数字，还可以是一个函数，返回要设置的数值。函数接受两个参数，第一个参数是元素在原先集合中的索引位置，第二个参数为原先的宽度。</desc>
        </params>
        <example>
          <desc>将所有段落的宽设为 20:</desc>
          <code>Dom.query("p").setWidth(20);</code>
        </example>
		 */
		setWidth: function(value) {
		
			this.dom.style.width = value > 0 ? value + 'px': value <= 0 ? '0px': value;
			return this;
		},
	
		/**
		 * 获取元素自身大小（不带滚动条）。
		 * @param {Number} value 值。
		 * @return this
		 * <desc>为元素设置CSS高度(hidth)属性的值。如果没有明确指定单位（如：em或%），使用px。</desc>
        <longdesc>如果没有明确指定单位（如：em或%），使用px。</longdesc>
        <params name="val" type="String, Number, Function">
          <desc>设定CSS中 'height' 的值，可以是字符串或者数字，还可以是一个函数，返回要设置的数值。函数接受两个参数，第一个参数是元素在原先集合中的索引位置，第二个参数为原先的高度。</desc>
        </params>
        <example>
          <desc>把所有段落的高设为 20:</desc>
          <code>Dom.query("p").setHeight(20);</code>
        </example>
		 */
		setHeight: function(value) {
	
			this.dom.style.height = value > 0 ? value + 'px': value <= 0 ? '0px': value;
			return this;
		},
	
		/**
		 * 设置元素的相对位置。
		 * @param {Point} System
		 * @return this
		 * <desc>设置置元素相对父元素的偏移。</desc>
        <longdesc>setOffset()方法可以让我们重新设置元素的位置。这个元素的位置是相对于低级对象的。如果对象原先的position样式属性是static的话，会被改成relative来实现重定位。</longdesc>
        <params name="coordinates" type="Object{top,left}, function(index, coords) ">
          <desc>一个对象，必须包含x和y属性，作为元素的新坐标。这个参数也可以是一个返回一对坐标的函数，函数的第一个参数是元素的索引，第二个参数是当前的坐标。</desc>
        </params>
        <example>
          <desc>设置第一段的偏移</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;</html>
          <code>
            Dom.query("p:first").setOffset({ x: 10, y: 30 });
          </code>
          <result>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;left: 15, top: 15&lt;/p&gt;</result>
        </example>
		 */
		setOffset: function(offsetPoint) {
		
			assert(Object.isObject(offsetPoint), "Dom.prototype.setOffset(System): {System} 必须有 'x' 和 'y' 属性。", System);
			var s = this.dom.style;
			
			if(offsetPoint.y != null)
				s.top = offsetPoint.y + 'px';
				
			if(offsetPoint.x != null)
				s.left = offsetPoint.x + 'px';
			return this;
		},
	
		/**
		 * 设置元素的固定位置。
		 * @param {Number} x 坐标。
		 * @param {Number} y 坐标。
		 * @return this
		 * <desc>获取匹配元素在当前视口的相对偏移。</desc>
        <longdesc>返回的对象包含两个整型属性：x 和 y。此方法只对可见元素有效。</longdesc>
        <example>
          <desc>获取第二段的偏移</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;</html>
          <code>
            var p = Dom.query("p:last");
            var position = p.getPosition();
            p.html( "left: " + position.x + ", top: " + position.y );
          </code>
          <result>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;left: 0, top: 35&lt;/p&gt;</result>
        </example>
        
         <desc>设置匹配元素相对于document对象的坐标。</desc>
        <longdesc>setPosition()方法可以让我们重新设置元素的位置。这个元素的位置是相对于document对象的。如果对象原先的position样式属性是static的话，会被改成relative来实现重定位。</longdesc>
        <params name="coordinates" type="Object{top,left}, function(index, coords) ">
          <desc>一个对象，必须包含x和y属性，作为元素的新坐标。这个参数也可以是一个返回一对坐标的函数，函数的第一个参数是元素的索引，第二个参数是当前的坐标。</desc>
        </params>
        <example>
          <desc>设置第二段的偏移</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;</html>
          <code>Dom.query("p:last").setPosition({ x: 10, y: 30 });</code>
        </example>
		 */
		setPosition: function(x, y) {
			var me = this,
				offset = me.getOffset().sub(me.getPosition()),
				offsetPoint = formatPoint(x, y);
		
			if (offsetPoint.y != null) offset.y += offsetPoint.y; 
			else offset.y = null;
		
			if (offsetPoint.x != null) offset.x += offsetPoint.x; 
			else offset.x = null;
		
			Dom.movable(me.dom);
		
			return me.setOffset(offset);
		},
	
		/**
		 * 滚到。
		 * @param {Element} dom
		 * @param {Number} x 坐标。
		 * @param {Number} y 坐标。
		 * @return this
		 */
		setScroll: function(x, y) {
			var elem = this.dom,
				offsetPoint = formatPoint(x, y);
		
			if (offsetPoint.x != null) elem.scrollLeft = offsetPoint.x;
			if (offsetPoint.y != null) elem.scrollTop = offsetPoint.y;
			return this;
	
		},
		
		/**
		 * <desc>JPlus 给所有匹配的元素附加一个事件处理函数，即使这个元素是以后再添加进来的也有效。</desc>
        <longdesc>
          这个方法是基本是的 .bind() 方法的一个变体。使用 .bind() 时，选择器匹配的元素会附加一个事件处理函数，而以后再添加的元素则不会有。为此需要再使用一次 .bind() 才行。比如说

          &lt;pre&gt;&amp;lt;body&amp;gt;
          &amp;lt;div class=&quot;clickme&quot;&amp;gt;Click here&amp;lt;/div&amp;gt;
          &amp;lt;/body&amp;gt;
          &lt;/pre&gt;

          可以给这个元素绑定一个简单的click事件：

          &lt;pre&gt;Dom.query('.clickme').bind('click', function() {
          alert("Bound handler called.");
          });
          &lt;/pre&gt;

          当点击了元素，就会弹出一个警告框。然后，想象一下这之后有另一个元素添加进来了。

          &lt;pre&gt;Dom.query('body').append('&amp;lt;div class=&quot;clickme&quot;&amp;gt;Another target&amp;lt;/div&amp;gt;');&lt;/pre&gt;

          尽管这个新的元素也能够匹配选择器 ".clickme" ，但是由于这个元素是在调用 .bind() 之后添加的，所以点击这个元素不会有任何效果。

          .live() 就提供了对应这种情况的方法。如果我们是这样绑定click事件的：

          &lt;pre&gt;Dom.query('.clickme').live('click', function() {
          alert("Live handler called.");
          });&lt;/pre&gt;

          然后再添加一个新元素：

          &lt;pre&gt;Dom.query('body').append('&amp;lt;div class=&quot;clickme&quot;&amp;gt;Another target&amp;lt;/div&amp;gt;');&lt;/pre&gt;

          然后再点击新增的元素，他依然能够触发事件处理函数。

          '''事件委托'''

          .live() 方法能对一个还没有添加进DOM的元素有效，是由于使用了事件委托：绑定在祖先元素上的事件处理函数可以对在后代上触发的事件作出回应。传递给 .live() 的事件处理函数不会绑定在元素上，而是把他作为一个特殊的事件处理函数，绑定在 DOM 树的根节点上。在我们的例子中，当点击新的元素后，会依次发生下列步骤：

          &lt;ol&gt;
          &lt;li&gt;生成一个click事件传递给 &amp;lt;div&amp;gt; 来处理 &lt;/li&gt;
          &lt;li&gt;由于没有事件处理函数直接绑定在 &amp;lt;div&amp;gt; 上，所以事件冒泡到DOM树上&lt;/li&gt;
          &lt;li&gt;事件不断冒泡一直到DOM树的根节点，默认情况下上面绑定了这个特殊的事件处理函数。&lt;/li&gt;
          &lt;li&gt;执行由 .live() 绑定的特殊的 click 事件处理函数。&lt;/li&gt;
          &lt;li&gt;这个事件处理函数首先检测事件对象的 target 来确定是不是需要继续。这个测试是通过检测 Dom.query(event.target).closest('.clickme') 能否找到匹配的元素来实现的。&lt;/li&gt;
          &lt;li&gt;如果找到了匹配的元素，那么调用原始的事件处理函数。&lt;/li&gt;
          &lt;/ol&gt;

          由于只有在事件发生时才会在上面的第五步里做测试，因此在任何时候添加的元素都能够响应这个事件。

          '''附加说明'''

          .live() 虽然很有用，但由于其特殊的实现方式，所以不能简单的在任何情况下替换 .bind()。主要的不同有：

          &lt;ul&gt;
          &lt;li&gt;在JPlus 1.4中，.live()方法支持自定义事件，也支持所有的 JavaScript 事件。在JPlus 1.4.1中，甚至也支持 focus 和 blue 事件了（映射到更合适，并且可以冒泡的focusin和focusout上）。另外，在JPlus 1.4.1中，也能支持hover（映射到&quot;mouseenter mouseleave&quot;）。然而在JPlus 1.3.x中，只支持支持的JavaScript事件和自定义事件：click, dblclick, keydown, keypress, keyup, mousedown, mousemove, mouseout, mouseover, 和 mouseup.&lt;/li&gt;
          &lt;li&gt;.live() 并不完全支持通过DOM遍历的方法找到的元素。取而代之的是，应当总是在一个选择器后面直接使用 .live() 方法，正如前面例子里提到的。&lt;/li&gt;
          &lt;li&gt;当一个事件处理函数用 .live() 绑定后，要停止执行其他的事件处理函数，那么这个函数必须返回 false。 仅仅调用 .stopPropagation() 无法实现这个目的。&lt;/li&gt;
          &lt;/ul&gt;        </longdesc>
        <params name="type" type="String">
          <desc>事件类型</desc>
        </params>
        <params name="data" type="Object" optional="true">
          <desc>欲绑定的事件处理函数</desc>
        </params>
        <params name="fn" type="Function">
          <desc>欲绑定的事件处理函数</desc>
        </params>
        <example>
          <desc>点击生成的p依然据有同样的功能。</desc>
          <html>&lt;p&gt;Click me!&lt;/p&gt;</html>
          <code>
            Dom.query("p").live("click", function(){
            Dom.query(this).after("&lt;p&gt;Another paragraph!&lt;/p&gt;");
            });
          </code>
        </example>
        <example>
          <desc>阻止默认事件行为和事件冒泡，返回 false </desc>
          <code>Dom.query("a").live("click", function() { return false; });</code>
        </example>
        <example>
          <desc>仅仅阻止默认事件行为</desc>
          <code>
            Dom.query("a").live("click", function(event){
            event.preventDefault();
            });
          </code>
        </example>
		 */
		delegate: function(selector, eventName, handler){
			
			assert.isFunction(handler, "Dom.prototype.delegate(selector, eventName, handler): {handler}  ~");
			
			this.on(eventName, function(e){
				var target = e.getTarget();
				if(e.getTarget().match(selector)){
					return handler.call(this, e, target);
				}
			});
			
		}

	})

	.implement({
		
		/**
		 * 获取节点样式。
		 * @param {String} name 键。
		 * @return {String} 样式。 getStyle() 不被支持，需要使用 name 来获取样式。
		 * <desc>访问元素的样式属性。</desc>
        <params name="name" type="String">
          <desc>要访问的属性名称</desc>
        </params>
        <example>
          <desc>取得第一个段落的color样式属性的值。</desc>
          <code>Dom.query("p").getStyle("color");</code>
        </example>
		 */
		getStyle: function(name) {
		
			var elem = this.dom;
		
			assert.isString(name, "Dom.prototype.getStyle(name): {name} ~");
			assert(elem.style, "Dom.prototype.getStyle(name): 当前Dom 对象对应的节点不是元素，无法使用样式。");
		
			return elem.style[name = name.replace(rStyle, formatStyle)] || getStyle(elem, name);
		
		},
	
		/// #if CompactMode
		
		/**
		 * 获取透明度。
		 * @method
		 * @return {Number} 透明度。 0 - 1 范围。
		 */
		getOpacity: 'opacity' in div.style ? function() {
			return styleNumber(this.dom, 'opacity');
		}: function() {
			return rOpacity.test(styleString(this.dom, 'filter')) ? parseInt(RegExp.$1) / 100: 1;
		},
	
		/// #else
		///
		/// getOpacity: function () {
		///
		/// 	return styleNumber(this.dom, 'opacity');
		///
		/// },
		
		/// #endif
		
		/**
		 * 获取元素的属性值。
		 * @param {String} name 要获取的属性名称。
		 * @return {String} 返回属性值。如果元素没有相应属性，则返回 null 。
	 	 * @static
        <example>
          <desc>返回文档中第一个图像的src属性值。</desc>
          <html>&lt;img id="img" src="test.jpg"/&gt;</html>
          <code>Dom.get("img").getAttr("src");</code>
          <result>test.jpg</result>
        </example>
		 */
		getAttr: function(name) {
			return Dom.getAttr(this.dom, name);
		},
	
		/**
		 * 检查当前的元素是否含有某个特定的类。
		 * @param {String} className 要判断的类名。只允许一个类名。
		 * @return {Boolean} 如果存在则返回 true。
        <example>
          <desc>给包含有某个类的元素进行一个动画。</desc>
          <html>&lt;div class="protected"&gt;&lt;/div&gt;&lt;div&gt;&lt;/div&gt;</html>
          <code>Dom.query("div").on('click', function(){
            if ( Dom.query(this).hasClass("protected") )
            Dom.query(this)
            .animate({ left: -10 })
            .animate({ left: 10 })
            .animate({ left: -10 })
            .animate({ left: 10 })
            .animate({ left: 0 });
            });</code>
        </example>
		 */
		hasClass: function(className) {
			return Dom.hasClass(this.dom, className);
		},
	
		/**
		 * 取得元素的内容。对于输入框则获取其输入的值。
		 * @return {String} 文本内容。对普通节点返回 textContent 属性, 对输入框返回 value 属性， 对普通节点返回 nodeValue 属性。
		 * @remark 
		 * 结果是由所有匹配元素包含的文本内容组合起来的文本。这个方法对HTML和XML文档都有效。
		 *  <example>
          <desc>获取文本框中的值</desc>
          <html>&lt;input type="text" value="some text"/&gt;</html>
          <code>Dom.query("input").getText();</code>
          <result>["some text"]</result>
        </example>
		 */
		getText: function() {
			return Dom.getText(this.dom);
		},
	
		/**
		 * 取得元素的html内容。
		 * @return {String} HTML 字符串。
        <example>
          <desc>获取一个节点的内部 html </desc>
          <html>&lt;div id="a"&gt;&lt;p/&gt;&lt;/div&gt;</html>
          <code>$Dom.query("a").getHtml();</code>
          <result>"&lt;p/&gt;"</result>
        </example>
		 */
		getHtml: function() {
			assert(this.dom.nodeType === 1, "Dom.prototype.getHtml(): 仅当 dom.nodeType === 1 时才能使用此函数。"); 
			return this.dom.innerHTML;
		},
	
		/**
		 * 获取元素可视区域大小。包括 border 大小。
		 * @return {Point} 位置。
		 * <desc>获取元素实际占用大小（包括内边距和边框）。</desc>
        <longdesc>此方法对可见和隐藏元素均有效。</longdesc>
        <example>
          <desc>获取第一段落实际大小。</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;</html>
          <code>Dom.query("p:first").getSize();</code>
          <result>{x=200,y=100}</result>
        </example>
		 */
		getSize: function() {
			var elem = this.dom;
		
			return new Point(elem.offsetWidth, elem.offsetHeight);
		},
	
		/**
		 * 获取元素自身大小（不带滚动条）。
		 * @return {Point} 位置。
		 * <desc>取得元素当前计算的宽度值（px）。</desc>
        <longdesc>在 JPlus 1.2 以后可以用来获取 window 和 document 的宽</longdesc>
        <example>
          <desc>获取第一段的宽</desc>
          <code>Dom.query("p").getWidth();</code>
        </example>
        <example>
          <desc>获取当前浏览器窗口的宽度</desc>
          <code>Dom.query(window).getWidth();</code>
        </example>
        <example>
          <desc>获取当前HTML文档宽度</desc>
          <code>Dom.query(document).getWidth();</code>
        </example>
		 */
		getWidth: function() {
			return styleNumber(this.dom, 'width');
		},
	
		/**
		 * 获取元素自身大小（不带滚动条）。
		 * @return {Point} 位置。
		 *   <desc>取得元素当前计算的高度值（px）。</desc>
        <longdesc>在 JPlus 1.2 以后可以用来获取 window 和 document 的高</longdesc>
        <example>
          <desc>获取第一段的高</desc>
          <code>Dom.query("p").getHeight();</code>
        </example>
        <example>
          <desc>获取当前浏览器窗口的高度</desc>
          <code>Dom.query(window).getHeight();</code>
        </example>
        <example>
          <desc>获取当前HTML文档高度</desc>
          <code>Dom.query(document).getHeight();</code>
        </example>
		 */
		getHeight: function() {
			return styleNumber(this.dom, 'height');
		},
	
		/**
		 * 获取滚动区域大小。
		 * @return {Point} 位置。
		 * <desc>获取元素实际大小宽度（包括整个滚动区域）。</desc>
        <longdesc>此方法对可见和隐藏元素均有效。</longdesc>
        <example>
          <desc>获取第一段落外部宽度。</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;</html>
          <code>Dom.query("p:first")。getScrollSize();</code>
          <result>{x=220,y=120}</result>
        </example>
		 */
		getScrollSize: function() {
			var elem = this.dom;
		
			return new Point(elem.scrollWidth, elem.scrollHeight);
		},
		
		/**
		 * 获取元素的相对位置。
		 * @return {Point} 位置。
		 * <desc>获取匹配元素相对父元素的偏移。</desc>
        <longdesc>返回的对象包含两个整型属性：x 和 y。为精确计算结果，请在补白、边框和填充属性上使用像素单位。此方法只对可见元素有效。</longdesc>
        <example>
          <desc>获取第一段的偏移</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;</html>
          <code>
            var p = Dom.query("p:first");
            var offset = p.getOffset();
            Dom.query("p:last").html( "left: " + offset.x + ", top: " + offset.y );
          </code>
          <result>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;left: 15, top: 15&lt;/p&gt;</result>
        </example>
		 */
		getOffset: function() {
			// 如果设置过 left top ，这是非常轻松的事。
			var elem = this.dom, left = elem.style.left, top = elem.style.top;
		
			// 如果未设置过。
			if(!left || !top) {
		
				// 绝对定位需要返回绝对位置。
				if(styleString(elem, "position") === 'absolute') {
					top = this.offsetParent();
					left = this.getPosition();
					if(!rBody.test(top.dom.nodeName))
						left = left.sub(top.getPosition());
					left.x -= styleNumber(elem, 'marginLeft') + styleNumber(top.dom, 'borderLeftWidth');
					left.y -= styleNumber(elem, 'marginTop') + styleNumber(top.dom, 'borderTopWidth');
		
					return left;
				}
		
				// 非绝对的只需检查 css 的style。
				left = getStyle(elem, 'left');
				top = getStyle(elem, 'top');
			}
		
			// 碰到 auto ， 空 变为 0 。
			return new Point(parseFloat(left) || 0, parseFloat(top) || 0);
		},
	
		/**
		 * 获取距父元素的偏差。
		 * @return {Point} 位置。
		 * <desc>获取匹配元素在当前视口的相对偏移。</desc>
        <longdesc>返回的对象包含两个整型属性：x 和 y。此方法只对可见元素有效。</longdesc>
        <example>
          <desc>获取第二段的偏移</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;</html>
          <code>
            var p = Dom.query("p:last");
            var position = p.getPosition();
            p.html( "left: " + position.x + ", top: " + position.y );
          </code>
          <result>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;left: 0, top: 35&lt;/p&gt;</result>
        </example>
		 */
		getPosition: div.getBoundingClientRect ? function() {
			var elem = this.dom, 
				bound = elem.getBoundingClientRect(),
				doc = getDocument(elem),
				html = doc.dom,
				htmlScroll = doc.getScroll();
			return new Point(bound.left + htmlScroll.x - html.clientLeft, bound.top + htmlScroll.y - html.clientTop);
		}: function() {
			var elem = this.dom, System = new Point(0, 0), t = elem.parentNode;
		
			if(styleString(elem, 'position') === 'fixed')
				return new Point(elem.offsetLeft, elem.offsetTop).add(document.getScroll());
		
			while(t && !rBody.test(t.nodeName)) {
				System.x -= t.scrollLeft;
				System.y -= t.scrollTop;
				t = t.parentNode;
			}
			t = elem;
		
			while(elem && !rBody.test(elem.nodeName)) {
				System.x += elem.offsetLeft;
				System.y += elem.offsetTop;
				if(navigator.isFirefox) {
					if(styleString(elem, 'MozBoxSizing') !== 'border-box') {
						add(elem);
					}
					var parent = elem.parentNode;
					if(parent && styleString(parent, 'overflow') !== 'visible') {
						add(parent);
					}
				} else if(elem !== t && navigator.isSafari) {
					add(elem);
				}
		
				if(styleString(elem, 'position') === 'fixed') {
					System = System.add(document.getScroll());
					break;
				}
				elem = elem.offsetParent;
			}
			if(navigator.isFirefox && styleString(t, 'MozBoxSizing') !== 'border-box') {
				System.x -= styleNumber(t, 'borderLeftWidth');
				System.y -= styleNumber(t, 'borderTopWidth');
			}
		
			function add(elem) {
				System.x += styleNumber(elem, 'borderLeftWidth');
				System.y += styleNumber(elem, 'borderTopWidth');
			}
		
			return System;

		},
	
		/**
		 * 获取滚动条已滚动的大小。
		 * @return {Point} 位置。
		 * <desc>获取匹配元素相对滚动条顶部的偏移。</desc>
        <longdesc>此方法对可见和隐藏元素均有效。</longdesc>
        <example>
          <desc>获取第一段相对滚动条顶部的偏移</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;2nd Paragraph&lt;/p&gt;</html>
          <code>
            var p = Dom.query("p:first");
            Dom.query("p:last").text( "scrollTop:" + p.getScroll() );
          </code>
          <result>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;scrollTop: 0&lt;/p&gt;</result>
        </example>
		 */
		getScroll: getScroll

	}, 2)

	.implement({
		
		// 父节点。
		/**
		 *  <desc>取得一个包含着所有匹配元素的祖先元素。可以通过一个可选的表达式进行筛选。</desc>
        <params name="filter" type="Integer/String/Function/Boolean" optional="true">
          <desc>用于查找子元素的 CSS 选择器 或者 元素在Control对象中的索引 或者 用于筛选元素的过滤函数 或者 true 则同时接收包含文本节点的所有节点。</desc>
        </params>
        <example>
          <desc>找到每个span元素的所有祖先元素。</desc>
          <html>&lt;html&gt;&lt;body&gt;&lt;div&gt;&lt;p&gt;&lt;span&gt;Hello&lt;/span&gt;&lt;/p&gt;&lt;span&gt;Hello Again&lt;/span&gt;&lt;/div&gt;&lt;/body&gt;&lt;/html&gt;</html>
          <code>Dom.query("span").getParent()</code>
        </example>
		 */
		parent: createTreeWalker('parentNode'),

		/**
		 * 获取第一个子元素。
		 *  <params name="filter" type="Integer/String/Function/Boolean" optional="true">
          <desc>用于查找子元素的 CSS 选择器 或者 元素在Control对象中的索引 或者 用于筛选元素的过滤函数 或者 true 则同时接收包含文本节点的所有节点。</desc>
        </params>
        <example>
          <desc>获取匹配的第二个元素</desc>
          <html>&lt;p&gt; This is just a test.&lt;/p&gt; &lt;p&gt; So is this&lt;/p&gt;</html>
          <code>Dom.query("p").getChild(1)</code>
          <result>[ &lt;p&gt; So is this&lt;/p&gt; ]</result>
        </example>
		 */
		first: createTreeWalker('nextSibling', 'firstChild'),

		/**
		 * <desc>获取最后一个子元素</desc>
        <params name="index" type="Integer/String/Function/Boolean" optional="true">
          <desc>用于查找子元素的 CSS 选择器 或者 元素在Control对象中的索引 或者 用于筛选元素的过滤函数 或者 true 则同时接收包含文本节点的所有节点。</desc>
        </params>
        <example>
          <desc>获取匹配的第二个元素</desc>
          <html>&lt;p&gt; This is just a test.&lt;/p&gt; &lt;p&gt; So is this&lt;/p&gt;</html>
          <code>Dom.query("p").getChild(1)</code>
          <result>[ &lt;p&gt; So is this&lt;/p&gt; ]</result>
        </example>
		 */
		last: createTreeWalker('previousSibling', 'lastChild'),

		/**
		 * <desc>取得一个包含匹配的元素集合中每一个元素紧邻的后面同辈元素的元素集合。</desc>
        <longdesc>这个函数只返回后面那个紧邻的同辈元素，而不是后面所有的同辈元素（可以使用nextAll）。可以用一个可选的表达式进行筛选。</longdesc>
        <params name="filter" type="Integer/String/Function/Boolean" optional="true">
          <desc>用于查找子元素的 CSS 选择器 或者 元素在Control对象中的索引 或者 用于筛选元素的过滤函数 或者 true 则同时接收包含文本节点的所有节点。</desc>
        </params>
        <example>
          <desc>找到每个段落的后面紧邻的同辈元素。</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;Hello Again&lt;/p&gt;&lt;div&gt;&lt;span&gt;And Again&lt;/span&gt;&lt;/div&gt;</html>
          <code>Dom.query("p").getNext()</code>
          <result>[ &lt;p&gt;Hello Again&lt;/p&gt;, &lt;div&gt;&lt;span&gt;And Again&lt;/span&gt;&lt;/div&gt; ]</result>
        </example>
		 */
		next: createTreeWalker('nextSibling'),

		// 前面的节点。
		/**
		 *  <desc>取得一个包含匹配的元素集合中每一个元素紧邻的前一个同辈元素的元素集合。</desc>
        <longdesc>可以用一个可选的表达式进行筛选。只有紧邻的同辈元素会被匹配到，而不是前面所有的同辈元素。</longdesc>
        <params name="filter" type="Integer/String/Function/Boolean" optional="true">
          <desc>用于查找子元素的 CSS 选择器 或者 元素在Control对象中的索引 或者 用于筛选元素的过滤函数 或者 true 则同时接收包含文本节点的所有节点。</desc>
        </params>
        <example>
          <desc>找到每个段落紧邻的前一个同辈元素。</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;div&gt;&lt;span&gt;Hello Again&lt;/span&gt;&lt;/div&gt;&lt;p&gt;And Again&lt;/p&gt;</html>
          <code>Dom.query("p").getPrevious()</code>
          <result>[ &lt;div&gt;&lt;span&gt;Hello Again&lt;/span&gt;&lt;/div&gt; ]</result>
        </example>
        <example>
          <desc>找到每个段落紧邻的前一个同辈元素中类名为selected的元素。</desc>
          <html>&lt;div&gt;&lt;span&gt;Hello&lt;/span&gt;&lt;/div&gt;&lt;p class="selected"&gt;Hello Again&lt;/p&gt;&lt;p&gt;And Again&lt;/p&gt;</html>
          <code>Dom.query("p").getPrevious("div")</code>
          <result>[ &lt;p class="selected"&gt;Hello Again&lt;/p&gt; ]</result>
        </example>
		 */
		prev: createTreeWalker('previousSibling'),

		// 全部子节点。
		/**
		 * desc>取得一个包含所有子元素的元素集合。</desc>
        <longdesc>可以通过可选的表达式来过滤所匹配的子元素。注意：parents()将查找所有祖辈元素，而children()只考虑子元素而不考虑所有后代元素。</longdesc>
        <params name="filter" type="Integer/String/Function/Boolean" optional="true">
          <desc>用于查找子元素的 CSS 选择器 或者 元素在Control对象中的索引 或者 用于筛选元素的过滤函数 或者 true 则同时接收包含文本节点的所有节点。</desc>
        </params>
        <example>
          <desc>查找DIV中的每个子元素。</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;div&gt;&lt;span&gt;Hello Again&lt;/span&gt;&lt;/div&gt;&lt;p&gt;And Again&lt;/p&gt;</html>
          <code>Dom.query("div").getChildren()</code>
          <result>[ &lt;span&gt;Hello Again&lt;/span&gt; ]</result>
        </example>
        <example>
          <desc>在每个div中查找 div。</desc>
          <html>&lt;div&gt;&lt;span&gt;Hello&lt;/span&gt;&lt;p class="selected"&gt;Hello Again&lt;/p&gt;&lt;p&gt;And Again&lt;/p&gt;&lt;/div&gt;</html>
          <code>Dom.query("div").getChildren("div")</code>
          <result>[ &lt;p class="selected"&gt;Hello Again&lt;/p&gt; ]</result>
        </example>
		 */
		children: function(args){
			return dir(this.dom.firstChild, 'nextSibling', args);
		},
		
		// 号次。
		index: 'nodeIndex' in div ? function(){
			return this.dom.nodeIndex;
		} : function() {
			var i = 0, elem = this.dom;
			while( elem = elem.previousSibling)
				if(elem.nodeType === 1)
					i++;
			return i;
		},
		
		/**
		 * 获取全部满足要求的节点的集合。
		 * @param {String} direction 遍历的方向方向，可以是以下值之一:
		 * - previousSibling: 遍历当前节点以前的节点。
		 * - previousSibling: 遍历当前节点以后的节点。
		 * - parentNode: 遍历当前节点的父节点。
		 */
		getAll: function(direction, args){
			switch(direction) {
				case 'child':
					return new DomList(this.dom.getElementsByTagName(args || '*'));
				case 'next':
					direction += 'Sibling';
					break;
				case 'prev':
					direction += 'iousSibling';
					break;
				case 'parent':
					direction += 'Node';
					break;
				case 'sibling':
					return this.getAll('prev').concat(this.getAll('next'));
			}
			return dir(this.dom[direction], direction, args);
		},

		/**
		 * 搜索所有与指定CSS表达式匹配的第一个元素。
		 * @param {String} selecter 用于查找的表达式。
		 * @return {Dom} 返回元素的 Dom 包装。如果找不到元素，则返回 null。
        <example>
          <desc>从所有的段落开始，进一步搜索下面的span元素。与Dom.query("p span")相同。</desc>
          <html>&lt;p&gt;&lt;span&gt;Hello&lt;/span&gt;, how are you?&lt;/p&gt;</html>
          <code>Dom.query("p").find("span")</code>
          <result>[ &lt;span&gt;Hello&lt;/span&gt; ]</result>
        </example>
		 */
		find: function(selector){
			assert.isString(selector, "Dom.prototype.find(selector): selector ~。");
			var elem = this.dom, result;
			if(elem.nodeType !== 1) {
				return document.find.call(this, selector)
			}
			
			try{ 
				var oldId = elem.id, displayId = oldId;
				if(!oldId){
					elem.id = displayId = '__SELECTOR__';
					oldId = 0;
				}
				result = elem.querySelector('#' + displayId +' ' + selector);
			} catch(e) {
				result = query(selector, this)[0];
			} finally {
				if(oldId === 0){
					elem.id = null;	
				}
			}

			return result ? new Dom(result) : null;
		},
		
		/**
		 * 搜索所有与指定表达式匹配的元素。
		 * @param {String} 用于查找的表达式。
		 * @return {NodeList} 节点。
        <example>
          <desc>从所有的段落开始，进一步搜索下面的span元素。与Dom.query("p span")相同。</desc>
          <html>&lt;p&gt;&lt;span&gt;Hello&lt;/span&gt;, how are you?&lt;/p&gt;</html>
          <code>Dom.query("p").query("span")</code>
          <result>[ &lt;span&gt;Hello&lt;/span&gt; ]</result>
        </example>
		 */
		query: function(selector){
			assert.isString(selector, "Dom.prototype.find(selector): selector ~。");
			assert(selector, "Dom.prototype.find(selector): {selector} 不能为空。", selector);
			var elem = this.dom, result;
			
			if(elem.nodeType !== 1) {
				return document.query.call(this, selector)
			}
			
			try{ 
				var oldId = elem.id, displayId = oldId;
				if(!oldId){
					elem.id = displayId = '__SELECTOR__';
					oldId = 0;
				}
				result = elem.querySelectorAll('#' + displayId +' ' + selector);
			} catch(e) {
				result = query(selector, this);
			} finally {
				if(oldId === 0){
					elem.id = null;	
				}
			}
			
			
			
			return new DomList(result);
		},
			
		// 偏移父位置。
		offsetParent: function() {
			var me = this.dom;
			while(( me = me.offsetParent) && !rBody.test(me.nodeName) && styleString(me, "position") === "static");
			return new Dom(me || getDocument(this.dom).body);
		},
	 
		/**
		 * 在某个位置插入一个HTML 。
		 * @param {String/Element} html 内容。
		 * @param {String} [where] 插入地点。 beforeBegin 节点外 beforeEnd 节点里
		 *            afterBegin 节点外 afterEnd 节点里
		 * @return {Element} 插入的节点。
		 * <desc>向每个匹配的元素内部前置内容。</desc>
        <longdesc>这是向所有匹配元素内部的开始处插入内容的最佳方式。</longdesc>
        <params name="where" type="String">
          <desc>可以是 beforeBegin; beforeEnd; afterBegin; afterEnd 之一，表示插入的位置。</desc>
        </params>
        <params name="content" type="String, Element, Control">
          <desc>要插入到目标元素内部前端的内容</desc>
        </params>
        <example>
          <desc>向所有段落中前置一些HTML标记代码。</desc>
          <html>&lt;p&gt;I would like to say: &lt;/p&gt;</html>
          <code>Dom.query("p").insert("afterBegin","&lt;b&gt;Hello&lt;/b&gt;");</code>
          <result>[ &lt;p&gt;&lt;b&gt;Hello&lt;/b&gt;I would like to say: &lt;/p&gt; ]</result>
        </example>
		 */
		insert: function(where, html) {
		
			assert(' afterEnd beforeBegin afterBegin beforeEnd '.indexOf(' ' + where + ' ') >= 0, "Dom.prototype.insert(where, html): {where} 必须是 beforeBegin、beforeEnd、afterBegin 或 afterEnd 。", where);
		
			var me = this,
				parentControl = me,
				refChild = me;
				
			html = Dom.parse(html, me.dom);
		
			switch (where) {
				case "afterEnd":
					refChild = me.next(true);
				
					// 继续。
				case "beforeBegin":
					parentControl = me.parent();
					assert(parentControl, "Dom.prototype.insert(where, html): 节点无父节点时无法执行 insert({where})。", where);
					break;
				case "afterBegin":
					refChild = me.first(true);
					break;
				default:
					refChild = null;
					break;
			}
		
			parentControl.insertBefore(html, refChild);
			return html;
		},
	
		/**
		 * 插入一个HTML 。
		 * @param {String/Element} html 内容。
		 * @return {Element} 元素。
		 */
		append: function(html) {
			html = Dom.parse(html, this);
			this.insertBefore(html, null);
			return html;
		},
		
		/**
		 * 将一个节点用另一个节点替换。
		 * @param {Element/String} html 内容。
		 * @return {Element} 替换之后的新元素。
		 * <desc>将所有匹配的元素替换成指定的HTML或DOM元素。</desc>
        <params name="content" type="String, Element, JPlus, Function">
          <desc>用于将匹配元素替换掉的内容。如果这里传递一个函数进来的话，函数返回值必须是HTML字符串。</desc>
        </params>
        <example>
          <desc>把所有的段落标记替换成加粗的标记。</desc>
          <html>&lt;p&gt;Hello&lt;/p&gt;&lt;p&gt;cruel&lt;/p&gt;&lt;p&gt;World&lt;/p&gt;</html>
          <code>Dom.query("p").replaceWith("&lt;b&gt;Paragraph. &lt;/b&gt;");</code>
          <result>&lt;b&gt;Paragraph. &lt;/b&gt;&lt;b&gt;Paragraph. &lt;/b&gt;&lt;b&gt;Paragraph. &lt;/b&gt;</result>
        </example>
        <example>
          <desc>用第一段替换第三段，你可以发现他是移动到目标位置来替换，而不是复制一份来替换。</desc>
          <html>
            &lt;div class=&quot;container&quot;&gt;
            &lt;div class=&quot;inner first&quot;&gt;Hello&lt;/div&gt;
            &lt;div class=&quot;inner second&quot;&gt;And&lt;/div&gt;
            &lt;div class=&quot;inner third&quot;&gt;Goodbye&lt;/div&gt;
            &lt;/div&gt;
          </html>
          <code>Dom.query('.third').replaceWith(Dom.query('.first'));</code>
          <result>
            &lt;div class=&quot;container&quot;&gt;
            &lt;div class=&quot;inner second&quot;&gt;And&lt;/div&gt;
            &lt;div class=&quot;inner first&quot;&gt;Hello&lt;/div&gt;
            &lt;/div&gt;
          </result>
		 */
		replaceWith: function(html) {
			var elem;
			html = Dom.parse(html, this.dom);
			if (elem = this.parent()) {
				elem.insertBefore(html, this);
				elem.removeChild(this);
			}
			
			return html;
		},
	
		/**
		 * 创建并返回Dom 对象的副本。
		 * @param {Boolean} cloneEvent=false 是否复制事件。
		 * @param {Boolean} contents=true 是否复制子元素。
		 * @param {Boolean} keepId=false 是否复制 id 。
		 * @return {Dom} 新的Dom 对象。
		 *  <desc>克隆匹配的DOM元素并且选中这些克隆的副本。</desc>
        <longdesc>在想把DOM文档中元素的副本添加到其他位置时这个函数非常有用。</longdesc>
        <example>
          <desc>克隆所有b元素（并选中这些克隆的副本），然后将它们前置到所有段落中。</desc>
          <html>&lt;b&gt;Hello&lt;/b&gt;&lt;p&gt;, how are you?&lt;/p&gt;</html>
          <code>Dom.query("b").clone().prependTo("p");</code>
          <result>&lt;b&gt;Hello&lt;/b&gt;&lt;p&gt;&lt;b&gt;Hello&lt;/b&gt;, how are you?&lt;/p&gt;</result>
        </example>
        <desc>元素以及其所有的事件处理并且选中这些克隆的副本</desc>
        <longdesc>在想把DOM文档中元素的副本添加到其他位置时这个函数非常有用。</longdesc>
        <params name="true" type="Boolean">
          <desc>设置为true以便复制元素的所有事件处理</desc>
        </params>
        <example>
          <desc>创建一个按钮，他可以复制自己，并且他的副本也有同样功能。</desc>
          <html>&lt;button&gt;Clone Me!&lt;/button&gt;</html>
          <code>
            Dom.query("button").click(function(){
            Dom.query(this).clone(true).insertAfter(this);
            });
          </code>
        </example>
		 */
		clone: function(cloneEvent, contents, keepId) {
		
			var elem = this.dom,
				clone = elem.cloneNode(contents = contents !== false);
			
			if(elem.nodeType === 1){
				if (contents) 
					for (var elemChild = elem.getElementsByTagName('*'), cloneChild = clone.getElementsByTagName('*'), i = 0; cloneChild[i]; i++) 
						cleanClone(elemChild[i], cloneChild[i], cloneEvent, keepId);
			
				cleanClone(elem, clone, cloneEvent, keepId);
			}
		
			return this.constructor === Dom ? new Dom(clone) : new this.constructor(clone);
		}
	 
	}, 3)

	.implement({
		
		/**
		 *  <desc>用一个表达式来检查当前选择的元素集合，如果其中至少有一个元素符合这个给定的表达式就返回true。</desc>
        <longdesc>如果没有元素符合，或者表达式无效，都返回  false 。</longdesc>
        <params name="expr" type="String">
          <desc>用于筛选的表达式</desc>
        </params>
        <example>
          <desc>由于input元素的父元素是一个表单元素，所以返回true。</desc>
          <html>&lt;form&gt;&lt;input type="checkbox" /&gt;&lt;/form&gt;</html>
          <code>Dom.query("input[type='checkbox']").match("input")</code>
          <result>true</result>
        </example>
		 */
		match: function (selector) {
			return Dom.match(this.dom, selector);
		},
		
		isHidden: function(){
			return Dom.isHidden(this.dom) || styleString(this.dom, 'visibility') !== 'hidden';
		},
		
		/**
		 * 判断一个节点是否有子节点。
		 * @param {Element} [Dom] 子节点。
		 * @return {Boolean} 有返回true 。
		 *  <desc>判断当前节点是否包含指定子节点。</desc>
        <longdesc>如果没有元素符合，或者表达式无效，都返回'false'。</longdesc>
        <params name="expr" type="String">
          <desc>用于判断的子节点。</desc>
        </params>
		 */
		hasChild: function(dom, allowSelf) {
			var elem = this.dom;
			if(dom){
				dom = Dom.getNode(dom);
				return (allowSelf && elem === dom) || Dom.hasChild(elem, dom);
			}
			
			return Dom.isEmpty(elem);
		}
		
	}, 4);
	
	/// #endif
	
	/// #region Dom.Document
	
	/**
	 * @class Dom.Document
	 */
	Dom.Document.implement({
		
		dataField: function(){
			return this.$data;
		},
		
		/**
		 * 插入一个HTML 。
		 * @param {String/Dom} html 内容。
		 * @return {Element} 元素。
		 * <desc>向每个匹配的元素内部追加内容。</desc>
        <longdesc>这个操作与对指定的元素执行appendChild方法，将它们添加到文档中的情况类似。</longdesc>
        <params name="content" type="String, Element, Control">
          <desc>要追加到目标中的内容</desc>
        </params>
        <example>
          <desc>向所有段落中追加一些HTML标记。</desc>
          <html>&lt;p&gt;I would like to say: &lt;/p&gt;</html>
          <code>Dom.query("p").append("&lt;b&gt;Hello&lt;/b&gt;");</code>
          <result>[ &lt;p&gt;I would like to say: &lt;b&gt;Hello&lt;/b&gt;&lt;/p&gt; ]</result>
        </example>
		 */
		append: function(html) {
			return new Dom(this.body).append(html);
		},
		
		/**
		 * 插入一个HTML 。
		 * @param {String/Dom} html 内容。
		 * @return {Element} 元素。
		 */
		insert: function(where, html) {
			return new Dom(this.body).insert(where, html);
		},
		
		/**
		 * 插入一个HTML 。
		 * @param {String/Dom} html 内容。
@return {Element} 元素。
		 */
		remove: function() {
			var body = new Dom(this.body);
			body.remove.apply(body, arguments);
			return this;
		},
		
		find: function(selector){
			assert.isString(selector, "Dom.prototype.find(selector): selector ~。");
			var result;
			try{
				result = this.querySelector(selector);
			} catch(e) {
				result = query(selector, this)[0];
			}
			return result ? new Dom(result) : null;
		},
		
		/**
		 * 执行选择器。
		 * @method
		 * @param {String} selecter 选择器。 如 h2 .cls attr=value 。
		 * @return {Element/undefined} 节点。
		 */
		query: function(selector){
			assert.isString(selector, "Dom.prototype.find(selector): selector ~。");
			var result;
			try{
				result = this.querySelectorAll(selector);
			} catch(e) {
				result = query(selector, this);
			}
			return new DomList(result);
		},
		
		/**
		 * 获取元素可视区域大小。包括 padding 和 border 大小。
		 * @method getSize
		 * @return {Point} 位置。
		 */
		getSize: function() {
			var doc = this.dom;

			return new Point(doc.clientWidth, doc.clientHeight);
		},
		
		/**
		 * 获取滚动区域大小。
		 * @return {Point} 位置。
		 */
		getScrollSize: function() {
			var html = this.dom, min = this.getSize(), body = this.body;

			return new Point(Math.max(html.scrollWidth, body.scrollWidth, min.x), Math.max(html.scrollHeight, body.scrollHeight, min.y));
		},

		/**
		 * 获取距父元素的偏差。
		 * @return {Point} 位置。
		 */
		getPosition: getWindowScroll,

		/**
		 * 获取滚动条已滚动的大小。
		 * @return {Point} 位置。
		 */
		getScroll: getWindowScroll,

		/**
		 * 滚到。
		 * @method setScroll
		 * @param {Number} x 坐标。
		 * @param {Number} y 坐标。
		 * @return {Document} this 。
		 * <desc>传递参数值时，设置垂直滚动条顶部偏移为该值。</desc>
        <longdesc>此方法对可见和隐藏元素均有效。</longdesc>
        <params name="val" type="String, Number">
          <desc>设定垂直滚动条值</desc>
        </params>
        <example>
          <desc>设置相对滚动条顶部的偏移</desc>
          <code>Dom.query("div.demo").setScroll(300);</code>
        </example>
		 */
		setScroll: function(x, y) {
			var doc = this, offsetPoint = formatPoint(x, y);
			if(offsetPoint.x == null)
				offsetPoint.x = doc.getScroll().x;
			if(offsetPoint.y == null)
				offsetPoint.y = doc.getScroll().y;
			(doc.defaultView || doc.parentWindow).scrollTo(offsetPoint.x, offsetPoint.y);

			return doc;
		}
		
	});

	/// #endif
	
	// 变量初始化。

	// 初始化 tagFix
	tagFix.optgroup = tagFix.option;
	tagFix.tbody = tagFix.tfoot = tagFix.colgroup = tagFix.caption = tagFix.thead;
	tagFix.th = tagFix.td;

	// 下列属性应该直接使用。
	map("checked selected disabled value innerHTML textContent className autofocus autoplay async controls hidden loop open required scoped compact nowrap ismap declare noshade multiple noresize defer readOnly tabIndex defaultValue accessKey defaultChecked cellPadding cellSpacing rowSpan colSpan frameBorder maxLength useMap contentEditable", function (value) {
		attrFix[value.toLowerCase()] = attrFix[value] = value;
	});

	textFix.INPUT = textFix.SELECT = textFix.TEXTAREA = 'value';

	textFix['#text'] = textFix['#comment'] = 'nodeValue';

	pep = Dom.Event.prototype;

	Dom.define(Dom, 'dom', 'scrollIntoView focus blur select click submit reset');
	Dom.addEvent('$default', eventObj);
	t = {};
	Dom.implement(map('on un trigger', function (name) {
		t[name] = function () {
			Dom.document[name].apply(Dom.document, arguments);
			return this;
		};

		return Dom.prototype[name];
	}, {}));
	
	t.once = Dom.prototype.once;
	Dom.Document.implement(t);

	t = DomList.prototype;

	map("shift pop unshift push include indexOf each forEach", function (value) {
		t[value] = ap[value];
	});

	map("filter slice splice reverse unique", function(value) {
		t[value] = function() {
			return new DomList(ap[value].apply(this, arguments));
		};
	});

	Point.format = formatPoint;
	
	document.dom = document.documentElement;

	/// #if CompactMode

	if(isStd) {

		/// #endif

		t = window.Event.prototype;
		t.stop = pep.stop
		t.getTarget = pep.getTarget;
		domReady = 'DOMContentLoaded';

		if (div.onmouseenter !== null) {

			Dom.addEvent('mouseenter mouseleave', {
				initEvent: function (e) {
					return this !== e.relatedTarget && !Dom.hasChild(this.dom, e.relatedTarget);
				}
			});

		}

		/// #if CompactMode
	} else {

		eventObj.initEvent = function (e) {
			if (!e.stop) {
				e.target = e.srcElement;
				e.stop = pep.stop;
				e.getTarget = pep.getTarget;
				e.stopPropagation = pep.stopPropagation;
				e.preventDefault = pep.preventDefault;
			}
		};

		Dom.addEvent("click dblclick mousedown mouseup mouseover mouseenter mousemove mouseleave mouseout contextmenu selectstart selectend", {
			init: function (e) {
				if(!e.stop) {
					eventObj.initEvent(e);
					e.relatedTarget = e.fromElement === e.target ? e.toElement: e.fromElement;
					var dom = getDocument(e.target).dom;
					e.pageX = e.clientX + dom.scrollLeft;
					e.pageY = e.clientY + dom.scrollTop;
					e.layerX = e.x;
					e.layerY = e.y;
					// 1 ： 单击 2 ： 中键点击 3 ： 右击
					e.which = (e.button & 1 ? 1: (e.button & 2 ? 3: (e.button & 4 ? 2: 0)));

				}
			}
		});

		Dom.addEvent("keydown keypress keyup",  {
			init: function (e) {
				if(!e.stop) {
					eventObj.initEvent(e);
					e.which = e.keyCode;
				}
			}
		});
		
		domReady = 'readystatechange';

		if (!('opacity' in div.style)) {
			styleFix.opacity = 'setOpacity';
		}
		
		Dom.propFix.OBJECT = 'outerHTML';

		attrFix.style = {

			get: function(elem, name) {
				return elem.style.cssText.toLowerCase();
			},
			set: function(elem, name, value) {
				elem.style.cssText = value;
			}
		};

		if(navigator.isQuirks) {

			attrFix.value = {

				node: function(elem, name) {
					assert(elem.getAttributeNode, "Dom.prototype.getAttr(name, type): 当前元素不存在 getAttributeNode 方法");
					return elem.tagName === 'BUTTON' ? elem.getAttributeNode(name) || {
						value: ''
					}: elem;
				},
				
				get: function(elem, name) {
					return this.node(elem, name).value;
				},
				
				set: function(elem, name, value) {
					this.node(elem, name).value = value || '';
				}
			};

			attrFix.href = attrFix.src = attrFix.usemap = {

				get: function(elem, name) {
					return elem.getAttribute(name, 2);
				},

				set: function(elem, name, value) {
					elem.setAttribute(name, value);
				}
			};
	
			try {
	
				// 修复IE6 因 css 改变背景图出现的闪烁。
				document.execCommand("BackgroundImageCache", false, true);
			} catch(e) {
	
			}

		}

	}
	
	/// #endif

	/**
	 * 设置在页面加载(不包含图片)完成时执行函数。
	 * @param {Functon} fn 当DOM加载完成后要执行的函数。
	 * @member Dom.ready
	 * @remark
	 * 允许你绑定一个在DOM文档载入完成后执行的函数。需要把页面中所有需要在 DOM 加载完成时执行的Dom.ready()操作符都包装到其中来。
	 * 
        <example>
          <desc>当DOM加载完成后，执行其中的函数。</desc>
          <code>Dom.ready(function(){
  // 文档就绪
});</code>
        </example>
	 */

	/**
	 * 设置在页面加载(包含图片)完成时执行函数。
	 * @param {Functon} fn 执行的函数。
	 * @member Dom.load
	 * @remark
	 * 允许你绑定一个在DOM文档载入完成后执行的函数。需要把页面中所有需要在 DOM 加载完成时执行的Dom.load()操作符都包装到其中来。
        <example>
          <desc>当DOM加载完成后，执行其中的函数。</desc>
          <code>Dom.load(function(){
  // 文档和引用的资源文件加载完成
});</code>
        </example>
	 */

	Dom.addEvent('domready domload', {});

	map('ready load', function(readyOrLoad, isLoad) {

		var isReadyOrIsLoad = isLoad ? 'isLoaded': 'isReady';

		// 设置 ready load
		Dom[readyOrLoad] = function (fn, bind) {
			
			// 忽略参数不是函数的调用。
			var isFn = Object.isFunction(fn);

			// 如果已载入，则直接执行参数。
			if(Dom[isReadyOrIsLoad]) {

				if (isFn)
					fn.call(bind);

			// 如果参数是函数。
			} else if (isFn) {

				document.on(readyOrLoad, fn, bind);

				// 触发事件。
				// 如果存在 JS 之后的 CSS 文件， 肯能导致 document.body 为空，此时延时执行 DomReady
			} else if (document.body) {

				// 如果 isReady, 则删除
				if(isLoad) {

					// 使用系统文档完成事件。
					isFn = Dom.window;
					fn = readyOrLoad;

					// 确保 ready 触发。
					Dom.ready();

				} else {
					isFn = Dom.document;
					fn = domReady;
				}

				eventObj.remove(isFn, fn, arguments.callee);

				// 先设置为已经执行。
				Dom[isReadyOrIsLoad] = true;

				// 触发事件。
				if (document.trigger(readyOrLoad, fn)) {

					// 删除事件。
					document.un(readyOrLoad);

				}
				
			} else {
				setTimeout(arguments.callee, 1);
			}

			return document;
		};

		readyOrLoad = 'dom' + readyOrLoad;
	});
	
	// 如果readyState 不是 complete, 说明文档正在加载。
	if(document.readyState !== "complete") {

		// 使用系统文档完成事件。
		eventObj.add(Dom.document, domReady, Dom.ready);

		eventObj.add(Dom.window, 'load', Dom.load, false);

		/// #if CompactMode
		
		// 只对 IE 检查。
		if(!isStd) {

			// 来自 jQuery
			// 如果是 IE 且不是框架
			var topLevel = false;

			try {
				topLevel = window.frameElement == null;
			} catch(e) {
			}

			if(topLevel && document.documentElement.doScroll) {

				/**
				 * 为 IE 检查状态。
				 * @private
				 */
				(function() {
					if(Dom.isReady) {
						return;
					}

					try {
						// http:// javascript.nwbox.com/IEContentLoaded/
						document.documentElement.doScroll("left");
					} catch(e) {
						setTimeout(arguments.callee, 1);
						return;
					}

					Dom.ready();
				})();
			}
		}

		/// #endif
	} else {
		setTimeout(Dom.load, 1);
	}
	
	div = null;

	extend(window, {

		Dom: Dom,

		Dom: Dom,

		Point: Point,
		
		DomList: DomList

	});

	Object.extendIf(window, {
		$: Dom.get,
		$$: Dom.query
	});
	
	/**
	 * @class
	 */

	/**
	 * 获取元素的文档。
	 * @param {Node} elem 元素。
	 * @return {Document} 文档。
	 */
	function getDocument(elem) {
		assert(elem && (elem.nodeType || elem.setInterval), 'Dom.getDocument(elem): {elem} 必须是节点。', elem);
		return elem.ownerDocument || elem.document || elem;
	}

	/**
	 * 返回简单的遍历函数。
	 * @param {Boolean} getFirst 返回第一个还是返回所有元素。
	 * @param {String} next 获取下一个成员使用的名字。
	 * @param {String} first=next 获取第一个成员使用的名字。
	 * @return {Function} 遍历函数。
	 */
	function createTreeWalker(next, first) {
		first = first || next;
		return function(args) {
			var node = this.dom[first];
			
			// 如果存在 args 编译为函数。
			if(args){
				args = getFilter(args);
			}
			
			while(node) {
				if(args ? args.call(this, node) : node.nodeType === 1)
					return new Dom(node);
				node = node[next];
			}
			
			return null;
		};
	}
	
	function dir(node, next, args){
			
		// 如果存在 args 编译为函数。
		if(args){
			args = getFilter(args);
		}
		
		var r = new DomList;
		while(node){
			if(args ? args.call(this, node) : node.nodeType === 1)
				r.push(node);	
			node = node[next];
		}
		
		return r;
	}
	
	/**
	 * 获取一个选择器。
	 * @param {Number/Function/String/Boolean} args 参数。
	 * @return {Funtion} 函数。
	 */
	function getFilter(args) {
		
		// 如果存在 args，则根据不同的类型返回不同的检查函数。
		switch (typeof args) {
			
			// 数字返回一个计数器函数。
			case 'number':
				return function(elem) {
					return elem.nodeType === 1 && --args < 0;
				};
				
			// 字符串，表示选择器。
			case 'string':
				if(/^(?:[-\w:]|[^\x00-\xa0]|\\.)+$/.test(args)) {
					args = args.toUpperCase();
					return function(elem) {
						return elem.nodeType === 1 && elem.tagName === args;
					};
				}
				return args === '*' ? null : function(elem) {
					return elem.nodeType === 1 && Dom.match(elem, args);
				};
				
			// 布尔类型，而且是 true, 返回 Function.from(true)，  表示不过滤。
			case 'boolean':
				args = returnTrue;
				break;
			
		}

		assert.isFunction(args, "Dom.prototype.getAll(direction, args): {args} 必须是一个函数、空、数字或字符串。", args);
		
		return args;
	}
	
	/**
	 * 删除由于拷贝导致的杂项。
	 * @param {Element} srcElem 源元素。
	 * @param {Element} destElem 目的元素。
	 * @param {Boolean} cloneEvent=true 是否复制数据。
	 * @param {Boolean} keepId=false 是否留下ID。
	 */
	function cleanClone(srcElem, destElem, cloneEvent, keepId) {

		if(!keepId && destElem.removeAttribute)
			destElem.removeAttribute('id');

		/// #if CompactMode
		
		if(destElem.clearAttributes) {

			// IE 会复制 自定义事件， 清楚它。
			destElem.clearAttributes();
			destElem.mergeAttributes(srcElem);
			destElem.$data = null;

			if(srcElem.options) {
				Object.each(srcElem.options, function(value){
					destElem.options.seleced = value.seleced;
				});
			}
		}

		/// #endif

		if(cloneEvent !== false) {
			
		    // event 作为系统内部对象。事件的拷贝必须重新进行 on 绑定。
		    var event = srcElem.$data && srcElem.$data.$event, dest;

		    if (event) {
		    	dest = new Dom(destElem);
			    for (cloneEvent in event)

				    // 对每种事件。
				    event[cloneEvent].handlers.forEach(function(handler) {

					    // 如果源数据的 target 是 src， 则改 dest 。
					    dest.on(cloneEvent, handler[0], handler[1].dom === srcElem ? dest : handler[1]);
				    });
			}
			
		}

		// 特殊属性复制。
		if( keepId = Dom.propFix[srcElem.tagName])
			destElem[keepId] = srcElem[keepId];
	}

	/**
	 * 清除节点的引用。
	 * @param {Element} elem 要清除的元素。
	 */
	function clean(elem) {

		// 删除自定义属性。
		if(elem.clearAttributes)
			elem.clearAttributes();

		// 删除事件。
		new Dom(elem).un();

		// 删除句柄，以删除双重的引用。
		elem.$data = null;

	}

	/**
	 * 到骆驼模式。
	 * @param {String} all 全部匹配的内容。
	 * @param {String} match 匹配的内容。
	 * @return {String} 返回的内容。
	 */
	function formatStyle(all, match) {
		return match ? match.toUpperCase(): styleFloat;
	}

	/**
	 * 读取样式字符串。
	 * @param {Element} elem 元素。
	 * @param {String} name 属性名。
	 * @return {String} 字符串。
	 */
	function styleString(elem, name) {
		assert.isElement(elem, "Dom.styleString(elem, name): {elem} ~");
		return elem.style[name] || getStyle(elem, name);
	}

	/**
	 * 读取样式数字。
	 * @param {Object} elem 元素。
	 * @param {Object} name 属性名。
	 * @return {Number} 数字。
	 */
	function styleNumber(elem, name) {
		assert.isElement(elem, "Dom.styleNumber(elem, name): {elem} ~");
		var value = parseFloat(elem.style[name]);
		if(!value && value !== 0) {
			value = parseFloat(getStyle(elem, name));

			if(!value && value !== 0) {
				if( name in styleFix) {
					
					var styles = {};
					for(var style in Dom.displayFix) {
						styles[style] = elem.style[style];
					}
					
					extend(elem.style, Dom.displayFix);
					value = parseFloat(getStyle(elem, name)) || 0;
					extend(elem.style, styles);
				} else {
					value = 0;
				}
			}
		}

		return value;
	}

	/**
	 * 转换参数为标准点。
	 * @param {Number} x X坐标。
	 * @param {Number} y Y坐标。
	 * @return {Object} {x:v, y:v}
	 */
	function formatPoint(x, y) {
		return x && typeof x === 'object' ? x: {
			x: x,
			y: y
		};
	}

	/// #region Selector
	
	function throwError(string) {
		throw new SyntaxError('An invalid or illegal string was specified : "' + string + '"!');
	}

	function match(dom, selector){
		var r, i = -1;
		try{
			r = dom.parentNode.querySelectorAll(selector);
		} catch(e){
			r = query(selector, new Dom(dom.parentNode));
		}
		
		while(r[++i])
			if(r[i] === dom)
				return true;
		
		return false;
	}

	/**
	 * 使用指定的选择器代码对指定的结果集进行一次查找。
	 * @param {String} selector 选择器表达式。
	 * @param {DomList/Dom} result 上级结果集，将对此结果集进行查找。
	 * @return {DomList} 返回新的结果集。
	 */
	function query(selector, result) {

		var prevResult = result,
			rBackslash = /\\/g, 
			m, 
			key, 
			value, 
			lastSelector, 
			filterData;
		
		selector = selector.trim();

		// 解析分很多步进行，每次解析  selector 的一部分，直到解析完整个 selector 。
		while(selector) {
			
			// 保存本次处理前的选择器。
			// 用于在本次处理后检验 selector 是否有变化。
			// 如果没变化，说明 selector 不能被正确处理，即 selector 包含非法字符。
			lastSelector = selector;
			
			// 解析的第一步: 解析简单选择器
			
			// ‘*’ ‘tagName’ ‘.className’ ‘#id’
			if( m = /^(^|[#.])((?:[-\w\*]|[^\x00-\xa0]|\\.)+)/.exec(selector)) {
				
				// 测试是否可以加速处理。
				if(!m[1] || (result[m[1] === '#' ? 'getElementById' : 'getElementsByClassName'])) {
					selector = RegExp.rightContext;
					switch(m[1]) {
						
						// ‘#id’
						case '#':
							result = result.getElementById(m[2]);
							result = new DomList(result && result.id === m[2] ? [result] : []);
							break;
							
						// ‘.className’
						case '.':
							result = new DomList(result.getElementsByClassName(m[2]));
							break;
							
						// ‘*’ ‘tagName’
						default:
							result = result.getAll('child', m[2].replace(rBackslash, ""));
							break;
								
					}
					
					// 如果仅仅为简单的 #id .className tagName 直接返回。
					if(!selector)
						break;
					
				// 无法加速，等待第四步进行过滤。
				} else {
					result = result.getAll('child');
				}
			
			// 解析的第二步: 解析父子关系操作符(比如子节点筛选)
			
			// ‘a>b’ ‘a+b’ ‘a~b’ ‘a b’ ‘a *’
			} else if(m = /^\s*([\s>+~<])\s*(\*|(?:[-\w*]|[^\x00-\xa0]|\\.)*)/.exec(selector)) {
				selector = RegExp.rightContext;
				
				var value = m[2].replace(rBackslash, "");
				
				switch(m[1]){
					case ' ':
						result = result.getAll('child', value);
						break;
						
					case '>':
						result = result.children(value);
						break;
						
					case '+':
						result = result.next(value);
						break;
						
					case '~':
						result = result.getAll('next', value);
						break;
						
					case '<':
						result = result.getAll('parent', value);
						break;
						
					default:
						throwError(m[1]);
				}
				
				// ‘a>b’: m = ['>', 'b']
				// ‘a>.b’: m = ['>', '']
				// result 始终实现了 IDom 接口，所以保证有 Dom.combinators 内的方法。

			// 解析的第三步: 解析剩余的选择器:获取所有子节点。第四步再一一筛选。
			} else {
				result = result.getAll('child');
			}
			
			// 解析的第四步: 筛选以上三步返回的结果。
	
			// ‘#id’ ‘.className’ ‘:filter’ ‘[attr’
			while(m = /^([#\.:]|\[\s*)((?:[-\w]|[^\x00-\xa0]|\\.)+)/.exec(selector)) {
				selector = RegExp.rightContext;
				value = m[2].replace(rBackslash, "");
				
				// ‘#id’: m = ['#','id']
				
				// 筛选的第一步: 分析筛选器。
	
				switch (m[1]) {
	
					// ‘#id’
					case "#":
						filterData = ["id", "=", value];
						break;
	
					// ‘.className’
					case ".":
						filterData = ["class", "~=", value];
						break;
	
					// ‘:filter’
					case ":":
						filterData = Dom.pseudos[value] || throwError(value);
						args = undefined;
	
						// ‘selector:nth-child(2)’
						if( m = /^\(\s*("([^"]*)"|'([^']*)'|[^\(\)]*(\([^\(\)]*\))?)\s*\)/.exec(selector)) {
							selector = RegExp.rightContext;
							args = m[3] || m[2] || m[1];
						}
						
						
						break;
	
					// ‘[attr’
					default:
						filterData = [value.toLowerCase()];
						
						// ‘selector[attr]’ ‘selector[attr=value]’ ‘selector[attr='value']’  ‘selector[attr="value"]’    ‘selector[attr_=value]’
						if( m = /^\s*(?:(\S?=)\s*(?:(['"])(.*?)\2|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/.exec(selector)) {
							selector = RegExp.rightContext;
							if(m[1]) {
								filterData[1] = m[1];
								filterData[2] = m[3] || m[4];
								filterData[2] = filterData[2] ? filterData[2].replace(/\\([0-9a-fA-F]{2,2})/g, toHex).replace(rBackslash, "") : "";
							}
						}
						break;
				}
		
				var args, 
					oldResult = result,
					i = 0,
					elem;
				
				// 筛选的第二步: 生成新的集合，并放入满足的节点。
				
				result = new DomList();
				if(filterData.call) {
					
					// 仅有 2 个参数则传入 oldResult 和 result
					if(filterData.length === 3){
						filterData(args, oldResult, result);
					} else {
						while(elem = oldResult[i++]) {
							if(filterData(elem, args))
								result.push(elem);
						}
					}
				} else {
					while(elem = oldResult[i++]){
						var actucalVal = Dom.getAttr(elem, filterData[0]),
							expectedVal = filterData[2],
							tmpResult;
						switch(filterData[1]){
							case undefined:
								tmpResult = actucalVal != null;
								break;
							case '=':
								tmpResult = actucalVal === expectedVal;
								break;
							case '~=':
								tmpResult = (' ' + actucalVal + ' ').indexOf(' ' + expectedVal + ' ') >= 0;
								break;
							case '!=':
								tmpResult = actucalVal !== expectedVal;
								break;
							case '|=':
								tmpResult = ('-' + actucalVal + '-').indexOf('-' + expectedVal + '-') >= 0;
								break;
							case '^=':
								tmpResult = actucalVal && actucalVal.indexOf(expectedVal) === 0;
								break;
							case '$=':
								tmpResult = actucalVal && actucalVal.substr(actucalVal.length - expectedVal.length) === expectedVal;
								break;
							case '*=':
								tmpResult = actucalVal && actucalVal.indexOf(expectedVal) >= 0;
								break;
							default:
								throw 'Not Support Operator : "' + filterData[1] + '"'
						}
						
						if(tmpResult){
							result.push(elem);	
						}
					}
				}
			}
			
			// 最后解析 , 如果存在，则继续。

			if( m = /^\s*,\s*/.exec(selector)) {
				selector = RegExp.rightContext;
				return result.concat(query(selector, prevResult));
			}


			if(lastSelector.length === selector.length){
				throwError(selector);
			}
		}
		
		return result;
	}
	
	function toHex(x, y) {
		return String.fromCharCode(parseInt(y, 16));
	}

	/// #endregion
	
})(this);
