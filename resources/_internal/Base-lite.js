/**
 * J+ Library Lite, 3.0
 * @projectDescription J+：轻便的、易扩展的UI组件库
 * @copyright 2011-2012 J+ Team
 * @fileOverview 定义最基本的工具函数。
 * @pragma defaultExtends JPlus.Base
 */

// 可用的宏
// 	Publish - 启用发布操作 - 删除 assert 和 trace 和 using 支持。


(function (window, undefined) {

	/// #region Core

	/**
	 * document 简写。
	 * @type Document
	 */
	var document = window.document,

        /**
         * Object 简写。
         * @type Function
         */
        Object = window.Object,

		/**
		 * Array.prototype 简写。
		 * @type  Object
		 */
		ap = Array.prototype,

		/**
		 * Object.prototype.toString 简写。
		 * @type Function
		 */
		toString = Object.prototype.toString,

		/**
		 * Object.prototype.hasOwnProperty 简写。
		 * @type Function
		 */
		hasOwnProperty = Object.prototype.hasOwnProperty,

		/**
		 * 空对象。
		 * @type Object
		 */
		emptyObj = {},

		/**
		 * 包含系统有关的函数。
		 * @type Object
		 * @namespace JPlus
		 */
		JPlus = window.JPlus = {

			/**
			 * 所有类的基类。
			 * @constructor
			 */
			Base: Base,

			/**
			 * 将一个原生的 Javascript 函数对象转换为一个类。
			 * @param {Function/Class} constructor 用于转换的对象，将修改此对象，让它看上去和普通的类一样。
			 * @return {Function} 返回生成的类。
			 * @remark 转换后的类将有继承、扩展等功能。
			 */
			Native: function (constructor) {

				// 简单拷贝 Object 的成员，即拥有类的特性。
				// 在 JavaScript， 一切函数都可作为类，故此函数存在。
				// Object 的成员一般对当前类构造函数原型辅助。
				return extend(constructor, classMembers);
			},

			/**
			 * id种子 。
			 * @type Number
			 * @defaultValue 1
			 * @example 下例演示了 JPlus.id 的用处。
			 * <pre>
			 *		var uid = JPlus.id++;  // 每次使用之后执行 ++， 保证页面内的 id 是唯一的。
			 * </pre>
			 */
			id: 1,

			/**
			 * 获取当前框架的版本号。
			 * @getter
			 */
			version: 3.2

		},
		
		/**
		 * 类成员方法。
		 * @type Object
		 */
		classMembers = {

			/**
			 * 扩展当前类的动态方法。
			 * @param {Object} members 用于扩展的成员列表。
			 * @return this
			 * @see #implementIf
			 * @example 以下示例演示了如何扩展 Number 类的成员。<pre>
			 * Number.implement({
			 *   sin: function () {
			 * 	    return Math.sin(this);
			 *  }
			 * });
			 *
			 * (1).sin();  //  Math.sin(1);
			 * </pre>
			 */
			implement: function (members) {

				assert(this.prototype, "System.Base.implement(members): 无法扩展当前类，因为当前类的 prototype 为空。");

				// 复制到原型 。
				extend(this.prototype, members);

				return this;
			},

			/**
			 * 扩展当前类的动态方法，但不覆盖已存在的成员。
			 * @param {Object} members 成员。
			 * @return this
			 * @see #implement
			 */
			implementIf: function (members) {

				assert(this.prototype, "System.Base.implementIf(members): 无法扩展当前类，因为当前类的 prototype 为空。");

				Object.extendIf(this.prototype, members);

				return this;
			},

			/**
			 * 添加当前类的动态方法，该方法基于某个属性的同名方法实现。
			 * @param {String} target 要基于的属性名。
			 * @param {String} setters 设置函数的方法名数组，用空格隔开。
			 * @param {String} getters 获取函数的方法名数组，用空格隔开。
			 * @static
			 * @example <code>
			 * MyClass.defineMethod('prop', 'fn');
			 * </code>
			 * 等价于 <code>
			 * MyClass.implement({fn:  function(){ this.prop.fn();  }})
			 * </code>
			 */
			defineMethod: function(targetProperty, setters, getters) {
				
				if (typeof getters === 'string') {
					this.defineMethod(targetProperty, getters, true);
					getters = 0;
				}

				this.implement(Object.map(setters, function(func) {
					return getters ? function(args1, args2) {
						return this[targetProperty][func](args1, args2);
					} : function(args1, args2) {
						this[targetProperty][func](args1, args2);
						return this;
					};
				}, {}), getters ? 2 : 1);

				return this;
			},

			/**
			 * 为当前类注册一个事件。
			 * @param {String} eventName 事件名。如果多个事件使用空格隔开。
			 * @param {Object} properties={} 事件信息。 具体见备注。
			 * @return this
			 * @remark
			 * 事件信息是一个JSON对象，它表明了一个事件在绑定、删除和触发后的一些操作。
			 *
			 * 事件信息的原型如:
			 * <pre>
			 * ({
			 *
			 *  // 当用户执行 target.on(type, fn) 时执行下列函数:
			 * 	add: function(target, type, fn){
			 * 		// 其中 target 是目标对象，type是事件名， fn是执行的函数。
			 *  },
			 *
			 *  // 当用户执行 target.un(type, fn) 时执行下列函数:
			 *  remove: function(target, type, fn){
			 * 		// 其中 target 是目标对象，type是事件名， fn是执行的函数。
			 *  },
			 *
			 *  // 当用户执行 target.trigger(e) 时执行下列函数:
			 *  trigger: function(target, type, fn, e){
			 * 		// 其中 target 是目标对象，type是事件名， fn是执行的函数。e 是参数。
			 *  },
			 *
			 *  // 当 fn 被执行时首先执行下列函数:
			 *  initEvent: function(e){
			 * 		// 其中 e 是参数。
			 *  }
			 *
			 * });
			 * </pre>
			 *
			 * 当用户使用 obj.on('事件名', 函数) 时， 系统会判断这个事件是否已经绑定过， 如果之前未绑定事件，则会创建新的函数
			 * evtTrigger， evtTrigger 函数将遍历并执行 evtTrigger.handlers 里的成员,
			 * 如果其中一个函数执行后返回 false， 则中止执行，并返回 false， 否则返回 true。
			 * evtTrigger.handlers 表示 当前这个事件的所有实际调用的函数的数组。
			 * 然后系统会调用 add(obj, '事件名', evtTrigger) 然后把 evtTrigger 保存在 obj.dataField().$event['事件名'] 中。
			 * 如果 之前已经绑定了这个事件，则 evtTrigger 已存在，无需创建。 这时系统只需把 函数 放到 evtTrigger.handlers 即可。
			 *
			 * 真正的事件触发函数是 evtTrigger， evtTrigger会执行 initEvent 和用户定义的一个事件全部函数。
			 *
			 * 当用户使用 obj.un('事件名', 函数) 时， 系统会找到相应 evtTrigger， 并从
			 * evtTrigger.handlers 删除 函数。 如果 evtTrigger.handlers 是空数组， 则使用
			 * remove(obj, '事件名', evtTrigger) 移除事件。
			 *
			 * 当用户使用 obj.trigger(参数) 时， 系统会找到相应 evtTrigger， 如果事件有trigger， 则使用
			 * trigger(obj, '事件名', evtTrigger, 参数) 触发事件。 如果没有， 则直接调用
			 * evtTrigger(参数)。
			 *
			 * 下面分别介绍各函数的具体内容。
			 *
			 * add 表示 事件被绑定时的操作。 原型为:
			 *
			 * <pre>
			 * function add(elem, type, fn) {
			 * 	   // 对于标准的 DOM 事件， 它会调用 elem.addEventListener(type, fn, false);
			 * }
			 * </pre>
			 *
			 * elem表示绑定事件的对象，即类实例。 type 是事件类型， 它就是事件名，因为多个事件的 add 函数肯能一样的，
			 * 因此 type 是区分事件类型的关键。fn 则是绑定事件的函数。
			 *
			 * remove 类似 add。
			 *
			 * $default 是特殊的事件名，它的各个信息将会覆盖同类中其它事件未定义的信息。
			 *
			 * @example 下面代码演示了如何给一个类自定义事件，并创建类的实例，然后绑定触发这个事件。
			 * <pre>
			 * // 创建一个新的类。
			 * var MyCls = new Class();
			 *
			 * MyCls.addEvents('click', {
			 *
			 * 		add:  function (elem, type, fn) {
			 * 	   		alert("为  elem 绑定 事件 " + type );
			 * 		}
			 *
			 * });
			 *
			 * var m = new MyCls;
			 * m.on('myEvt', function () {  //  输出 为  elem 绑定 事件  myEvt
			 * 	  alert(' 事件 触发 ');
			 * });
			 *
			 * m.trigger('myEvt', 2);
			 *
			 * </pre>
			 */
			addEvents: function (eventName, properties) {

				assert.isString(eventName, "System.Base.addEvents(eventName, properties): {eventName} ~");

				var eventObj = this.$event || (this.$event = {}),
					defaultEvent = eventObj.$default;
					
				if(properties) {
					Object.extendIf(properties, defaultEvent);
					if(properties.base) {
						assert(defaultEvent, "使用 base 字段功能必须预先定义 $default 事件。");
						properties.add = function(ctrl, type, fn){
							defaultEvent.add(ctrl, this.base, fn);
						};
						
						properties.remove = function(ctrl, type, fn){
							defaultEvent.remove(ctrl, this.base, fn);
						};
					}
				} else {
					properties = defaultEvent || emptyObj;
				}

				// 更新事件对象。
				eventName.split(' ').forEach(function (value) {
					eventObj[value] = properties;
				});

				return this;
			},

			/**
			 * 继承当前类创建并返回子类。
			 * @param {Object/Function} [methods] 子类的员或构造函数。
			 * @return {Function} 返回继承出来的子类。
			 * @remark
			 * 在 Javascript 中，继承是依靠原型链实现的， 这个函数仅仅是对它的包装，而没有做额外的动作。
			 *
			 * 成员中的 constructor 成员 被认为是构造函数。
			 *
			 * 这个函数实现的是 单继承。如果子类有定义构造函数，则仅调用子类的构造函数，否则调用父类的构造函数。
			 *
			 * 要想在子类的构造函数调用父类的构造函数，可以使用 {@link JPlus.Base#base} 调用。
			 *
			 * 这个函数返回的类实际是一个函数，但它被 {@link JPlus.Native} 修饰过。
			 *
			 * 由于原型链的关系， 肯能存在共享的引用。 如: 类 A ， A.prototype.c = []; 那么，A的实例 b ,
			 * d 都有 c 成员， 但它们共享一个 A.prototype.c 成员。 这显然是不正确的。所以你应该把 参数 quick
			 * 置为 false ， 这样， A创建实例的时候，会自动解除共享的引用成员。 当然，这是一个比较费时的操作，因此，默认
			 * quick 是 true 。
			 *
			 * 也可以把动态成员的定义放到 构造函数， 如: this.c = []; 这是最好的解决方案。
			 *
			 * @example 下面示例演示了如何创建一个子类。
			 * <pre>
			 * var MyClass = new Class(); //创建一个类。
			 *
			 * var Child = MyClass.extend({  // 创建一个子类。
			 * 	  type: 'a'
			 * });
			 *
			 * var obj = new Child(); // 创建子类的实例。
			 * </pre>
			 */
			extend: function (members) {

				// 未指定函数 使用默认构造函数(Object.prototype.constructor);

				// 生成子类 。
				var subClass = hasOwnProperty.call(members = members instanceof Function ? {
					constructor: members
				} : (members || {}), "constructor") ? members.constructor : function () {

					// 调用父类构造函数 。
					arguments.callee.base.apply(this, arguments);

				};

				// 代理类 。
				emptyFn.prototype = (subClass.base = this).prototype;

				// 指定成员 。
				subClass.prototype = Object.extend(new emptyFn, members);

				// 覆盖构造函数。
				subClass.prototype.constructor = subClass;

				// 清空临时对象。
				emptyFn.prototype = null;

				// 指定Class内容 。
				return JPlus.Native(subClass);

			}

		};

	/// #endregion

	/// #region Functions

	/**
	 * 系统原生的对象。
	 * @static class Object
	 */
	extend(Object, {

		/**
		 * 复制对象的所有属性到其它对象。
		 * @param {Object} dest 复制的目标对象。
		 * @param {Object} src 复制的源对象。
		 * @return {Object} 返回 *dest*。
		 * @see Object.extendIf
		 * @example <pre>
	     * var a = {v: 3}, b = {g: 2};
	     * Object.extend(a, b);
	     * trace(a); // {v: 3, g: 2}
	     * </pre>
		 */
		extend: extend,

		/**
		 * 复制对象的所有属性到其它对象，但不覆盖原对象的相应值。
		 * @param {Object} dest 复制的目标对象。
		 * @param {Object} src 复制的源对象。
		 * @return {Object} 返回 *dest*。
		 * @see Object.extend
		 * @example
		 * <pre>
	     * var a = {v: 3, g: 5}, b = {g: 2};
	     * Object.extendIf(a, b);
	     * trace(a); // {v: 3, g: 5}  b 未覆盖 a 任何成员。
	     * </pre>
		 */
		extendIf: function (dest, src) {

			assert(dest != null, "Object.extendIf(dest, src): {dest} 不可为空。", dest);

			// 和 extend 类似，只是判断目标的值是否为 undefiend 。
			for (var b in src)
				if (dest[b] === undefined)
					dest[b] = src[b];
			return dest;
		},

		/**
		 * 遍历一个类数组，并对每个元素执行函数 *fn*。
		 * @param {Function} fn 对每个元素运行的函数。函数的参数依次为:
		 *
		 * - {Object} value 当前元素的值。
		 * - {Number} index 当前元素的索引。
		 * - {Array} array 当前正在遍历的数组。
		 *
		 * 可以让函数返回 **false** 来强制中止循环。
		 * @param {Object} [bind] 定义 *fn* 执行时 **this** 的值。
		 * @return {Boolean} 如果循环是因为 *fn* 返回 **false** 而中止，则返回 **false**， 否则返回 **true**。
		 * @see Array#each
		 * @see Array#forEach
		 * @example
		 * <pre>
	     * Object.each({a: '1', c: '3'}, function (value, key) {
	     * 		trace(key + ' : ' + value);
	     * });
	     * // 输出 'a : 1' 'c : 3'
	     * </pre>
		 */
		each: function (iterable, fn, bind) {

			assert(!Object.isFunction(iterable), "Object.each(iterable, fn, bind): {iterable} 不能是函数。 ", iterable);
			assert(Object.isFunction(fn), "Object.each(iterable, fn, bind): {fn} 必须是函数。", fn);

			// 如果 iterable 是 null， 无需遍历 。
			if (iterable != null) {

				// 普通对象使用 for( in ) , 数组用 0 -> length 。
				if (typeof iterable.length !== "number") {

					// Object 遍历。
					for (var t in iterable)
						if (fn.call(bind, iterable[t], t, iterable) === false)
							return false;
				} else {
					return each.call(iterable, fn, bind);
				}

			}

			// 正常结束。
			return true;
		},

		/**
		 * 遍历一个类数组对象并调用指定的函数，返回每次调用的返回值数组。
		 * @param {Array/String/Object} iterable 任何对象，不允许是函数。如果是字符串，将会先将字符串用空格分成数组。
		 * @param {Function} fn 对每个元素运行的函数。函数的参数依次为:
		 *
		 * - {Object} value 当前元素的值。
		 * - {Number} index 当前元素的索引。
		 * - {Array} array 当前正在遍历的数组。
		 *
		 * @param {Object} [bind] 定义 *fn* 执行时 **this** 的值。
		 * @param {Object} [dest] 仅当 *iterable* 是字符串时，传递 *dest* 可以将函数的返回值保存到 dest。
		 * @return {Object/Undefiend} 返回的结果对象。当 *iterable* 是字符串时且未指定 dest 时，返回空。
		 * @example
		 * <pre>
	     * Object.map(["a","b"], function(a){return a + a}); // => ["aa", "bb"];
	     *
	     * Object.map({a: "a", b: "b"}, function(a){return a + a}); // => {a: "aa", b: "bb"};
	     *
	     * Object.map({length: 1, "0": "a"}, function(a){return a + a}); // => ["a"];
	     *
	     * Object.map("a b", function(a){return a + a}, {}); // => {a: "aa", b: "bb"};
	     * </pre>
		 */
		map: function (iterable, fn, dest) {

			assert(Object.isFunction(fn), "Object.map(iterable, fn): {fn} 必须是函数。 ", fn);

			var actualFn;

			// 如果是目标对象是一个字符串，则改为数组。
			if (typeof iterable === 'string') {
				iterable = iterable.split(' ');
				actualFn = dest ? function (value, key, array) {
					this[value] = fn(value, key, array);
				} : fn;
			} else {
				dest = typeof iterable.length !== "number" ? {} : [];
				actualFn = function (value, key, array) {
					this[key] = fn(value, key, array);
				};
			}

			// 遍历对象。
			Object.each(iterable, actualFn, dest);

			// 返回目标。
			return dest;
		},

		/**
		 * 判断一个变量是否是数组。
		 * @param {Object} obj 要判断的变量。
		 * @return {Boolean} 如果是数组，返回 true， 否则返回 false。
		 * @example
		 * <pre>
	     * Object.isArray([]); // true
	     * Object.isArray(document.getElementsByTagName("div")); // false
	     * Object.isArray(new Array); // true
	     * </pre>
		 */
		isArray: Array.isArray,

		/**
		 * 判断一个变量是否是函数。
		 * @param {Object} obj 要判断的变量。
		 * @return {Boolean} 如果是函数，返回 true， 否则返回 false。
		 * @example
		 * <pre>
	     * Object.isFunction(function () {}); // true
	     * Object.isFunction(null); // false
	     * Object.isFunction(new Function); // true
	     * </pre>
		 */
		isFunction: function (obj) {

			// 检查原型。
			return toString.call(obj) === "[object Function]";
		},

		/**
		 * 判断一个变量是否是引用变量。
		 * @param {Object} obj 变量。
		 * @return {Boolean} 如果 *obj* 是引用变量，则返回 **true**, 否则返回 **false** 。
		 * @remark 此函数等效于 `obj !== null && typeof obj === "object"`
		 * @example
		 * <pre>
	     * Object.isObject({}); // true
	     * Object.isObject(null); // false
	     * </pre>
		 */
		isObject: function (obj) {

			// 只检查 null 。
			return obj !== null && typeof obj === "object";
		},

		/**
		 * 一次性为一个对象设置属性。
		 * @param {Object} obj 目标对象。将对这个对象设置属性。
		 * @param {Object} options 要设置的属性列表。 函数会自动分析 *obj*, 以确认一个属性的设置方式。
		 * 比如设置 obj 的 key 属性为 值 value 时，系统会依次检测:
		 *
		 * - 尝试调用 obj.setKey(value)。
		 * - 尝试调用 obj.key(value)
		 * - 尝试调用 obj.key.set(value)
		 * - 尝试调用 obj.set(key, value)
		 * - 最后调用 obj.key = value
		 *
		 * @example <pre>
	     * var target = {
	     *
	     * 		setA: function (value) {
	     * 			assert.log("1");
	     * 			trace("设置 a =  ", value);
	     *		},
	     *
	     * 		b: function (value) {
	     * 			trace(value);
	     *		}
	     *
	     * };
	     *
	     * Object.set(target, {a: 8, b: 6, c: 4});
	     *
	     * </pre>
		 */
		set: function (obj, options) {

			assert.notNull(obj, "Object.set(obj, options): {obj} ~");

			for (var key in options) {

				// 检查 setValue 。
				var val = options[key],
			    	setter = 'set' + key.capitalize();

				if (Object.isFunction(obj[setter])) {
					obj[setter](val);

				} else if (key in obj) {

					setter = obj[key];

					// 是否存在函数。
					if (Object.isFunction(setter))
						obj[key](val);

						// 检查 value.set 。
					else if (setter && setter.set)
						setter.set(val);

						// 最后，就直接赋予。
					else
						obj[key] = val;
				}

						// 检查 set 。
				else if (obj.set)
					obj.set(key, val);

					// 最后，就直接赋予。
				else
					obj[key] = val;

			}

			return obj;

		}

	});

	/**
	 * @static class Function
	 */
	extend(Function, {

		/**
		 * 表示一个空函数。这个函数总是返回 undefined 。
		 * @property
		 * @type Function
		 * @remark
		 * 在定义一个类的抽象函数时，可以让其成员的值等于 **Function.empty** 。
		 */
		empty: emptyFn,

		/**
		 * 返回一个新函数，这个函数始终返回 *value*。
		 * @param {Object} value 需要返回的参数。
		 * @return {Function} 执行得到参数的一个函数。
		 * @example
		 * <pre>
		 * var fn = Function.from(0);
	     * fn()    // 0
	     * </pre>
	 	 */
		from: function (value) {

			// 返回一个值，这个值是当前的参数。
			return function () {
				return value;
			}
		}

	});

	/**
	 * 格式化指定的字符串。
	 * @param {String} formatString 字符。
	 * @param {Object} ... 格式化用的参数。
	 * @return {String} 格式化后的字符串。
  	 * @remark 格式化的字符串{}不允许包含空格。
	 *  不要出现{{{ 和 }}} 这样将获得不可预知的结果。
	 * @memberOf String
	 * @example <pre>
	 *  String.format("{0}转换", 1); //  "1转换"
	 *  String.format("{1}翻译",0,1); // "1翻译"
	 *  String.format("{a}翻译",{a:"也可以"}); // 也可以翻译
	 *  String.format("{{0}}不转换, {0}转换", 1); //  "{0}不转换1转换"
	 * </pre>
	 */
	String.format = function (formatString, args) {

		assert(!formatString || formatString.replace, 'String.format(formatString, args): {formatString} 必须是字符串。', formatString);

		// 支持参数2为数组或对象的直接格式化。
		var toString = this;

		args = arguments.length === 2 && Object.isObject(args) ? args : ap.slice.call(arguments, 1);

		// 通过格式化返回
		return formatString ? formatString.replace(/\{+?(\S*?)\}+/g, function (match, name) {
			var start = match.charAt(1) == '{', end = match.charAt(match.length - 2) == '}';
			if (start || end)
				return match.slice(start, match.length - end);
			return name in args ? toString(args[name]) : "";
		}) : "";
	};

	/**
	 * 将一个伪数组对象转为原生数组。
	 * @param {Object} iterable 一个伪数组对象。
	 * @param {Number} startIndex=0 转换开始的位置。
	 * @return {Array} 返回新数组，其值和 *value* 一一对应。
	 * @memberOf Array
	 * @remark iterable 不支持原生的 DomList 对象。
	 * @example
	 * <pre>
     * // 将 arguments 对象转为数组。
     * Array.create(arguments); // 返回一个数组
     *
     * // 获取数组的子集。
     * Array.create([4,6], 1); // [6]
     *
     * // 处理伪数组。
     * Array.create({length: 1, "0": "value"}); // ["value"]
     *
     * </pre>
	 */
	Array.create = function (iterable, startIndex) {
		// if(!iterable)
		// return [];

		// [DOM Object] 。
		// if(iterable.item) {
		// var r = [], len = iterable.length;
		// for(startIndex = startIndex || 0; startIndex < len;
		// startIndex++)
		// r[startIndex] = iterable[startIndex];
		// return r;
		// }

		assert(!iterable || toString.call(iterable) !== '[object HTMLCollection]' || typeof iterable.length !== 'number', 'Array.create(iterable, startIndex): {iterable} 不允许是 NodeList 。', iterable);

		// 调用 slice 实现。
		return iterable ? ap.slice.call(iterable, startIndex) : [];
	};

	/**
	 * @namespace window
	 */

	/**
	 * 创建一个类。
	 * @param {Object/Function} [methods] 类成员列表对象或类构造函数。
	 * @return {Function} 返回创建的类。
	 * @see JPlus.Base
	 * @see JPlus.Base.extend
	 * @example 以下代码演示了如何创建一个类:
	 * <pre>
	 * var MyCls = Class({
	 *
	 *    constructor: function (a, b) {
	 * 	      alert('构造函数执行了 ' + a + b);
	 *    },
	 *
	 *    say: function(){
	 *    	alert('调用了 say 函数');
	 *    }
	 *
	 * });
	 *
	 *
	 * var c = new MyCls('参数1', '参数2');  // 创建类。
	 * c.say();  //  调用 say 方法。
	 * </pre>
	 */
	window.Class = function (members) {
		return Base.extend(members);
	};

	if (!window.execScript) {

		/**
		 * 在全局作用域运行一个字符串内的代码。
		 * @param {String} statement Javascript 语句。
		 * @example
		 * <pre>
		 * execScript('alert("hello")');
		 * </pre>
		 */
		window.execScript = function (statements) {

			assert.isString(statements, "execScript(statements): {statements} ~");

			// 如果正常浏览器，使用 window.eval 。
			window["eval"].call(window, statements);

		};

	}

	/// #endregion

	/// #region Navigator

	/**
	 * 系统原生的浏览器对象实例。
	 * @type Navigator
	 * @namespace navigator
	 */
	(function (navigator) {

		// 检查信息
		var ua = navigator.userAgent,

			match = ua.match(/(IE|Firefox|Chrome|Safari|Opera)[\/\s]([\w\.]*)/i) || ua.match(/(WebKit|Gecko)[\/\s]([\w\.]*)/i) || [0, "", 0],

			// 浏览器名字。
			browser = match[1],

			isStd = eval("-[1,]");

		navigator["is" + browser] = navigator["is" + browser + parseInt(match[2])] = true;

		/**
		 * 获取一个值，该值指示是否为 IE 浏览器。
		 * @getter isIE
		 * @type Boolean
		 */

		/**
		 * 获取一个值，该值指示是否为 IE6 浏览器。
		 * @getter isIE6
		 * @type Boolean
		 */

		/**
		 * 获取一个值，该值指示是否为 IE7 浏览器。
		 * @getter isIE7
		 * @type Boolean
		 */

		/**
		 * 获取一个值，该值指示是否为 IE8 浏览器。
		 * @getter isIE8
		 * @type Boolean
		 */

		/**
		 * 获取一个值，该值指示是否为 IE9 浏览器。
		 * @getter isIE9
		 * @type Boolean
		 */

		/**
		 * 获取一个值，该值指示是否为 IE10 浏览器。
		 * @getter isIE10
		 * @type Boolean
		 */

		/**
		 * 获取一个值，该值指示是否为 Firefox 浏览器。
		 * @getter isFirefox
		 * @type Boolean
		 */

		/**
		 * 获取一个值，该值指示是否为 Chrome 浏览器。
		 * @getter isChrome
		 * @type Boolean
		 */

		/**
		 * 获取一个值，该值指示是否为 Opera 浏览器。
		 * @getter isOpera
		 * @type Boolean
		 */

		/**
		 * 获取一个值，该值指示是否为 Opera10 浏览器。
		 * @getter isOpera10
		 * @type Boolean
		 */

		/**
		 * 获取一个值，该值指示是否为 Safari 浏览器。
		 * @getter isSafari
		 * @type Boolean
		 */

		// 结果
		extend(navigator, {

			/// #if CompactMode

			/**
			 * 判断当前浏览器是否符合W3C标准。
			 * @getter
			 * @type Boolean
			 * @remark 就目前浏览器状况， 除了 IE6, 7, 8， 其它浏览器都返回 true。
			 */
			isStd: isStd,

			/**
			 * 获取一个值，该值指示当前浏览器是否支持标准事件。
			 * @getter
			 * @type Boolean
			 * @remark 就目前浏览器状况， IE6，7 中 isQuirks = true 其它浏览器都为 false 。
			 */
			isQuirks: !isStd && !Object.isObject(document.constructor),

			/// #endif

			/**
			 * 获取当前浏览器的名字。
			 * @getter
			 * @type String
			 * @remark
			 * 肯能的值有:
			 *
			 * - IE
			 * - Firefox
			 * - Chrome
			 * - Opera
			 * - Safari
			 *
			 * 对于其它非主流浏览器，返回其 HTML 引擎名:
			 *
			 * - Webkit
			 * - Gecko
			 * - Other
			 */
			name: browser,

			/**
			 * 获取当前浏览器版本。
			 * @getter
			 * @type String
			 * @remark 输出的格式比如 6.0.0 。 这是一个字符串，如果需要比较版本，应该使用
			 * <pre>
			 *       parseFloat(navigator.version) <= 5.5 。
			 * </pre>
			 */
			version: match[2]

		});

	})(window.navigator);

	/// #endregion

	/// #region Methods

	// 把所有内建对象本地化 。
	each.call([String, Array, Function, Date, Base], JPlus.Native);

	/**
	 * 所有由 new Class 创建的类的基类。
	 * @class JPlus.Base
	 */
	Base.implement({

		/**
    	 * 获取当前类对应的数据字段。
    	 * @proteced virtual
    	 * @returns {Object} 一个可存储数据的对象。
    	 * @remark 默认地， 此返回返回 this 。
    	 * 此函数的意义在于将类对象和真实的数据对象分离。
    	 * 这样可以让多个类实例共享一个数据对象。
    	 * @example
    	 * <pre>
	     *
	     * // 创建一个类 A
	     * var A = new Class({
	     *    fn: function (a, b) {
	     * 	    alert(a + b);
	     *    }
	     * });
	     *
	     * // 创建一个变量。
	     * var a = new A();
	     *
	     * a.dataField().myData = 2;
    	 * </pre>
    	 */
		dataField: function () {
			return this;
		},

		/**
	     * 调用父类的成员函数。
	     * @param {String} methodName 调用的函数名。
	     * @param {Object} [...] 调用的参数。如果不填写此项，则自动将当前函数的全部参数传递给父类的函数。
	     * @return {Object} 返回父类函数的返回值。
	     * @protected
	     * @example
	     * <pre>
	     *
	     * // 创建一个类 A
	     * var A = new Class({
	     *    fn: function (a, b) {
	     * 	    alert(a + b);
	     *    }
	     * });
	     *
	     * // 创建一个子类 B
	     * var B = A.extend({
	     * 	  fn: function (a, b) {
	     * 	    this.base('fn'); // 子类 B#a 调用父类 A#a
	     * 	    this.base('fn', 2, 4); // 子类 B#a 调用父类 A#a
	     *    }
	     * });
	     *
	     * new B().fn(1, 2); // 输出 3 和 6
	     * </pre>
	     */
		base: function (methodName) {

			var me = this.constructor,

	            fn = this[methodName],

	            oldFn = fn,

	            args = arguments;

			assert(fn, "Base.prototype.base(methodName, args): 子类不存在 {methodName} 的属性或方法。", name);

			// 标记当前类的 fn 已执行。
			fn.$bubble = true;

			assert(!me || me.prototype[methodName], "Base.prototype.base(methodName, args): 父类不存在 {methodName} 的属性或方法。", name);

			// 保证得到的是父类的成员。

			do {
				me = me.base;
				assert(me && me.prototype[methodName], "Base.prototype.base(methodName, args): 父类不存在 {methodName} 的属性或方法。", name);
			} while ('$bubble' in (fn = me.prototype[methodName]));

			assert.isFunction(fn, "Base.prototype.base(methodName, args): 父类的成员 {fn}不是一个函数。  ");

			fn.$bubble = true;

			// 确保 bubble 记号被移除。
			try {
				if (args.length <= 1)
					return fn.apply(this, args.callee.caller.arguments);
				args[0] = this;
				return fn.call.apply(fn, args);
			} finally {
				delete fn.$bubble;
				delete oldFn.$bubble;
			}
		},

		/**
		 * 增加一个事件监听者。
		 * @param {String} type 事件名。
		 * @param {Function} listener 监听函数。当事件被处罚时会执行此函数。
		 * @param {Object} bind=this *listener* 执行时的作用域。
		 * @return this
		 * @example
		 * <pre>
	     *
	     * // 创建一个类 A
	     * var A = new Class({
	     *
	     * });
	     *
	     * // 创建一个变量。
	     * var a = new A();
	     *
	     * // 绑定一个 click 事件。
         * a.on('click', function (e) {
         * 		return true;
         * });
         * </pre>
		 */
		on: function (type, listener, bind) {

			assert.isFunction(listener, 'System.Object.prototype.on(type, listener, bind): {listener} ~');

			// 获取本对象 本对象的数据内容 本事件值
			var me = this,
	        	d = me.dataField(),
	        	evt;

			d = d.$event || (d.$event = {});

			evt = d[type];

			// 如果未绑定过这个事件。
			if (!evt) {

				// 支持自定义安装。
				d[type] = evt = function (e) {
					var listener = arguments.callee, handlers = listener.handlers.slice(0), i = -1, len = handlers.length;

					// 循环直到 return false。
					while (++i < len)
						if (handlers[i][0].call(handlers[i][1], e) === false)
							return false;

					return true;
				};

				// 获取事件管理对象。
				d = getMgr(me, type);

				// 当前事件的全部函数。
				evt.handlers = d.initEvent ? [[d.initEvent, me]] : [];

				// 添加事件。
				if (d.add) {
					d.add(me, type, evt);
				}

			}

			// 添加到 handlers 。
			evt.handlers.push([listener, bind || me]);

			return me;
		},

		/**
		 * 删除一个或多个事件监听器。
		 * @param {String} [type] 事件名。如果不传递此参数，则删除全部事件的全部监听器。
		 * @param {Function} [listener] 回调器。如果不传递此参数，在删除指定事件的全部监听器。
		 * @return this
		 * @remark
		 * 注意: `function () {} !== function () {}`, 这意味着下列代码的 un 将失败:
		 * <pre>
         * elem.on('click', function () {});
         * elem.un('click', function () {});   // 无法删除 on 绑定的函数。
         * </pre>
		 * 正确的做法是把函数保存起来。 <pre>
         * var fn =  function () {};
         * elem.on('click', fn);
         * elem.un('click', fn); // fn  被成功删除。
         *
         * 如果同一个 *listener* 被增加多次， un 只删除第一个。
         * </pre>
		 * @example
		 * <pre>
	     *
	     * // 创建一个类 A
	     * var A = new Class({
	     *
	     * });
	     *
	     * // 创建一个变量。
	     * var a = new A();
	     *
	     * var fn = function (e) {
         * 		return true;
         * };
	     *
	     * // 绑定一个 click 事件。
         * a.on('click', fn);
         *
         * // 删除一个 click 事件。
         * a.un('click', fn);
         * </pre>
		 */
		un: function (type, listener) {

			assert(!listener || Object.isFunction(listener), 'System.Object.prototype.un(type, listener): {listener} 必须是函数或空参数。', listener);

			// 获取本对象 本对象的数据内容 本事件值
			var me = this, d = me.dataField().$event, evt, handlers, i;
			if (d) {
				if (evt = d[type]) {

					handlers = evt.handlers;

					if (listener) {

						i = handlers.length;

						// 搜索符合的句柄。
						while (--i >= 0) {
							if (handlers[i][0] === listener) {
								handlers.splice(i, 1);

								if (!i || (i === 1 && handlers[0] === d.initEvent)) {
									listener = 0;
								}

								break;
							}
						}

					}

					// 检查是否存在其它函数或没设置删除的函数。
					if (!listener) {

						// 删除对事件处理句柄的全部引用，以允许内存回收。
						delete d[type];

						d = getMgr(me, type);

						// 内部事件管理的删除。
						if (d.remove)
							d.remove(me, type, evt);
					}
				} else if (!type) {
					for (evt in d)
						me.un(evt);
				}
			}
			return me;
		},

		/**
		 * 手动触发一个监听器。
		 * @param {String} type 监听名字。
		 * @param {Object} [e] 传递给监听器的事件对象。
		 * @return this
		 * @example <pre>
	     *
	     * // 创建一个类 A
	     * var A = new Class({
	     *
	     * });
	     *
	     * // 创建一个变量。
	     * var a = new A();
	     *
	     * // 绑定一个 click 事件。
         * a.on('click', function (e) {
         * 		return true;
         * });
         *
         * // 手动触发 click， 即执行  on('click') 过的函数。
         * a.trigger('click');
         * </pre>
		 */
		trigger: function (type, e) {

			// 获取本对象 本对象的数据内容 本事件值 。
			var me = this, evt = me.dataField().$event, eMgr;

			// 执行事件。
			return !evt || !(evt = evt[type]) || ((eMgr = getMgr(me, type)).trigger ? eMgr.trigger(me, type, evt, e) : evt(e));

		},

		/**
		 * 增加一个仅监听一次的事件监听者。
		 * @param {String} type 事件名。
		 * @param {Function} listener 监听函数。当事件被处罚时会执行此函数。
		 * @param {Object} bind=this *listener* 执行时的作用域。
		 * @return this
		 * @example <pre>
	     *
	     * // 创建一个类 A
	     * var A = new Class({
	     *
	     * });
	     *
	     * // 创建一个变量。
	     * var a = new A();
	     *
         * a.once('click', function (e) {
         * 		trace('click 被触发了');
         * });
         *
         * a.trigger('click');   //  输出  click 被触发了
         * a.trigger('click');   //  没有输出
         * </pre>
		 */
		once: function (type, listener, bind) {

			assert.isFunction(listener, 'System.Object.prototype.once(type, listener): {listener} ~');

			var me = this;

			// one 本质上是 on , 只是自动为 listener 执行 un 。
			return this.on(type, function () {

				// 删除，避免闭包。
				me.un(type, arguments.callee);

				// 然后调用。
				return listener.apply(this, arguments);
			}, bind);
		}

	});

	/**
	 * 系统原生的字符串对象。
	 * @JPlus
	 * @class String
	 */
	String.implementIf({

		/**
		 * 将字符串转为骆驼格式。
		 * @return {String} 返回的内容。
		 * @remark
		 * 比如 "awww-bwww-cwww" 的骆驼格式为 "awwBwwCww"
		 * @example
		 * <pre>
	     * "font-size".toCamelCase(); //     "fontSize"
	     * </pre>
		 */
		toCamelCase: function () {
			return this.replace(/-(\w)/g, toUpperCase);
		},

		/**
		 * 将字符首字母大写。
		 * @return {String} 处理后的字符串。
		 * @example
		 * <pre>
	     * "aa".capitalize(); //     "Aa"
	     * </pre>
		 */
		capitalize: function () {

			// 使用正则实现。
			return this.replace(/(\b[a-z])/g, toUpperCase);
		}

	});

	/**
	 * 系统原生的数组对象。
	 * @JPlus
	 * @class Array
	 */
	Array.implementIf({

		/**
		 * 遍历当前数组，并对数组的每个元素执行函数 *fn*。
		 * @param {Function} fn 对每个元素运行的函数。函数的参数依次为:
		 *
		 * - {Object} value 当前元素的值。
		 * - {Number} index 当前元素的索引。
		 * - {Array} array 当前正在遍历的数组。
		 *
		 * 可以让函数返回 **false** 来强制中止循环。
		 * @param {Object} [bind] 定义 *fn* 执行时 **this** 的值。
		 * @return {Boolean} 如果循环是因为 *fn* 返回 **false** 而中止，则返回 **false**， 否则返回 **true**。
		 * @method
		 * @see Object.each
		 * @see #forEach
		 * @see #filter
		 * @see Object.map
		 * @remark
		 * 在高版本浏览器中，forEach 和 each 功能大致相同，但是 forEach 不支持通过 return false 中止循环。
		 * 在低版本(IE8-)浏览器中， forEach 为 each 的别名。
		 * @example 以下示例演示了如何遍历数组，并输出每个元素的值。
		 * <pre>
	     * [2, 5].each(function (value, index) {
	     * 		trace(value);
	     * });
	     * // 输出 '2 5'
	     * </pre>
	     *
	     * 以下示例演示了如何通过 return false 来中止循环。
	     * <pre>
	     * [2, 5].each(function (value, index) {
	     * 		trace(value);
	     * 		return false;
	     * });
	     * // 输出 '2'
	     * </pre>
		 */
		each: each,

		/**
		 * 如果当前数组中不存在指定 *value*， 则将 *value* 添加到当前数组的末尾。
		 * @param {Object} value 要添加的值。
		 * @return {Boolean} 如果此次操作已成功添加 *value*，则返回 **true**;
		 * 否则表示原数组已经存在 *value*，返回 **false**。
		 * @example
		 * <pre>
	     * ["", "aaa", "zzz", "qqq"].include(""); // 返回 true， 数组不变。
	     * [false].include(0);	// 返回 false， 数组变为 [false, 0]
	     * </pre>
		 */
		include: function (value) {

			// 未包含，则加入。
			var b = this.indexOf(value) !== -1;
			if (!b)
				this.push(value);
			return b;
		},

		/**
		 * 将指定的 *value* 插入到当前数组的指定位置。
		 * @param {Number} index 要插入的位置。索引从 0 开始。如果 *index* 大于数组的长度，则插入到末尾。
		 * @param {Object} value 要插入的内容。
		 * @return {Number} 返回实际插入到的位置。
		 * @example
		 * <pre>
	     * ["I", "you"].insert(1, "love"); //   ["I", "love", "you"]
	     * </pre>
		 */
		insert: function (index, value) {
			assert.isNumber(index, "Array.prototype.insert(index, value): {index} ~");
			var me = this, tmp;
			if (index < 0 || index >= me.length) {
				me[index = me.length++] = value;
			} else {
				tmp = ap.slice.call(me, index);
				me.length = index + 1;
				this[index] = value;
				ap.push.apply(me, tmp);
			}
			return index;

		},

		/**
		 * 对当前数组的每个元素调用其指定属性名的函数，并将返回值放入新的数组返回。
		 * @param {String} fnName 要调用的函数名。
		 * @param {Array} [args] 调用时的参数数组。
		 * @return {Array} 返回包含执行结果的数组。
		 * @example
		 * <pre>
	     * ["abc", "def", "ghi"].invoke('charAt', [0]); //  ['a', 'd', 'g']
	     * </pre>
		 */
		invoke: function (fnName, args) {
			assert(!args || typeof args.length === 'number', "Array.prototype.invoke(fnName, args): {args} 必须是参数数组。", args);
			var r = [];
			ap.forEach.call(this, function (value) {
				assert(value != null && value[fnName] && value[fnName].apply, "Array.prototype.invoke(fnName, args): {value} 不包含函数 {fnName}。", value, fnName);
				r.push(value[fnName].apply(value, args || []));
			});

			return r;
		},

		/**
		 * 删除数组中重复元素。
		 * @return {Array} this
		 * @example
		 * <pre>
	     * [1, 7, 8, 8].unique(); //    [1, 7, 8]
	     * </pre>
		 */
		unique: function () {

			// 删除从 i + 1 之后的当前元素。
			for (var i = 0, j, value; i < this.length;) {
				value = this[i];
				j = ++i;
				do {
					j = ap.remove.call(this, value, j);
				} while (j >= 0);
			}

			return this;
		},

		/**
		 * 删除当前数组中指定的元素。
		 * @param {Object} value 要删除的值。
		 * @param {Number} startIndex=0 开始搜索 *value* 的起始位置。
		 * @return {Number} 被删除的值在原数组中的位置。如果要擅长的值不存在，则返回 -1 。
		 * @remark
		 * 如果数组中有多个相同的值， remove 只删除第一个。
		 * @example
		 * <pre>
	     * [1, 7, 8, 8].remove(7); // 返回 1,  数组变成 [7, 8, 8]
	     * </pre>
	     *
	     * 以下示例演示了如何删除数组全部相同项。
	     * <pre>
	     * var arr = ["wow", "wow", "J+ UI", "is", "powerful", "wow", "wow"];
	     *
	     * // 反复调用 remove， 直到 remove 返回 -1， 即找不到值 wow
	     * while(arr.remove(wow) >= 0);
	     *
	     * trace(arr); // 输出 ["J+ UI", "is", "powerful"]
	     * </pre>
		 */
		remove: function (value, startIndex) {

			// 找到位置， 然后删。
			var i = ap.indexOf.call(this, value, startIndex);
			if (i !== -1)
				ap.splice.call(this, i, 1);
			return i;
		},

		/**
		 * 获取当前数组中指定索引的元素。
		 * @param {Number} index 要获取的元素索引。如果 *index* 小于 0， 则表示获取倒数 *index* 位置的元素。
		 * @return {Object} 指定位置所在的元素。如果指定索引的值不存在，则返回 undefined。
		 * @remark
		 * 使用 arr.item(-1) 可获取最后一个元素的值。
		 * @example
		 * <pre>
	     * [0, 1, 2, 3].item(0);  // 0
	     * [0, 1, 2, 3].item(-1); // 3
	     * [0, 1, 2, 3].item(5);  // undefined
	     * </pre>
		 */
		item: function (index) {
			return this[index < 0 ? this.length + index : index];
		}

	});

	/// #endregion

	/// #region Private Functions

	/**
	 * 复制所有属性到任何对象。
	 * @param {Object} dest 复制目标。
	 * @param {Object} src 要复制的内容。
	 * @return {Object} 复制后的对象。
	 */
	function extend(dest, src) {

		assert(dest != null, "Object.extend(dest, src): {dest} 不可为空。", dest);

		// 直接遍历，不判断是否为真实成员还是原型的成员。
		for (var b in src)
			dest[b] = src[b];
		return dest;
	}

	/**
	 * 对数组运行一个函数。
	 * @param {Function} fn 遍历的函数。参数依次 value, index, array 。
	 * @param {Object} bind 对象。
	 * @return {Boolean} 返回一个布尔值，该值指示本次循环时，有无出现一个函数返回 false 而中止循环。
	 */
	function each(fn, bind) {

		assert(Object.isFunction(fn), "Array.prototype.each(fn, bind): {fn} 必须是一个函数。", fn);

		var i = -1, me = this;

		while (++i < me.length)
			if (fn.call(bind, me[i], i, me) === false)
				return false;
		return true;
	}

	/**
	 * 所有自定义类的基类。
	 */
	function Base() {

	}

	/**
	 * 空函数。
	 */
	function emptyFn() {

	}

	/**
	 * 将一个字符转为大写。
	 * @param {String} ch 参数。
	 * @param {String} match 字符。
	 * @return {String} 转为大写之后的字符串。
	 */
	function toUpperCase(ch, match) {
		return match.toUpperCase();
	}

	/**
	 * 获取指定的对象所有的事件管理器。
	 * @param {Object} obj 要使用的对象。
	 * @param {String} type 事件名。
	 * @return {Object} 符合要求的事件管理器，如果找不到合适的，返回默认的事件管理器。
	 */
	function getMgr(obj, type) {
		var clazz = obj.constructor, t;

		// 遍历父类，找到指定事件。
		while (!(t = clazz.$event) || !(type in t)) {
			if (clazz.base === Base) {
				return t && t.$default || emptyObj;
			}
			clazz = clazz.base;
		}

		return t[type];
	}

	/// #endregion

})(this);

/// #if !Publish

JPlus.Base.prototype.toString = function () {
	for (var item in window) {
		if (window[item] === this.constructor)
			return item;
	}

	return "Object";
};

/// #endregion
