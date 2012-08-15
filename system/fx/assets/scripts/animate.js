/**
 * @fileOverview 通过改变CSS实现的变换。
 * @author xuld
 */


using("System.Fx.Base");
using("System.Dom.Base");


(function(){
	
	
	/// #region 字符串扩展
	
	/**
	 * @namespace String
	 */
	Object.extend(String, {
		
		/**
		 * 把十六进制颜色转为 RGB 数组。
		 * @param {String} hex 十六进制色。
		 * @return {Array} rgb RGB 数组。
		 */
		hexToArray: function(hex){
			assert.isString(hex, "String.hexToArray(hex): 参数 {hex} ~。");
			if(hex == 'transparent')
				return [255, 255, 255];
			var m = hex.match(/^#([\da-f]{1,2})([\da-f]{1,2})([\da-f]{1,2})$/i);
			if(!m)return null;
			var i = 0, r = [];
			while (++i <= 3) {
				var bit = m[i];
				r.push(parseInt(bit.length == 1 ? bit + bit : bit, 16));
			}
			return r;
		},
		
		/**
		 * 把 RGB 数组转为数组颜色。
		 * @param {Array} rgb RGB 数组。
		 * @return {Array} rgb RGB 数组。
		 */
		rgbToArray: function(rgb){
			assert.isString(rgb, "String.rgbToArray(rgb): 参数 {rgb} ~。");
			var m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
			if(!m) return null;
			var i = 0, r = [];
			while (++i <= 3) {
				r.push(parseInt(m[i]));
			}
			return r;
		},
		
		/**
		 * 把 RGB 数组转为十六进制色。
		 * @param {Array} rgb RGB 数组。
		 * @return {String} hex 十六进制色。
		 */
		arrayToHex: function(rgb){
			assert.isArray(rgb, "String.arrayToHex(rgb): 参数 {rgb} ~。");
			var i = -1, r = [];
			while(++i < 3) {
				var bit = rgb[i].toString(16);
				r.push((bit.length == 1) ? '0' + bit : bit);
			}
			return '#' + r.join('');
		}
	});
	
	/// #endregion
	
	/**
	 * compute 简写。
	 * @param {Object} from 从。
	 * @param {Object} to 到。
	 * @param {Object} delta 变化。
	 * @return {Object} 结果。
	 */
	var compute = Fx.compute,
	
		Dom = window.Dom,

		emptyObj = {},
	
		/**
		 * @class Animate
		 * @extends Fx.Base
		 */
		Animate = Fx.Animate = Fx.extend({
			
			/**
			 * 当前绑定的节点。
			 * @type Dom
			 * @protected
			 */
			target: null,
			
			/**
			 * 当前的状态存储。
			 * @type Object
			 * @protected
			 */
			current: null,
			
			/**
			 * 初始化当前特效。
			 * @param {Object} options 选项。
			 * @param {Object} key 键。
			 * @param {Number} duration 变化时间。
			 */
			constructor: function(target){
				this.target = target;
			},
			
			/**
			 * 根据指定变化量设置值。
			 * @param {Number} delta 变化量。 0 - 1 。
			 * @override
			 */
			set: function(delta){
				var me = this,
					key,
					target = me.target,
					value;
				for(key in me.current){
					value = me.current[key];
					value.parser.set(target, key, value.from, value.to, delta);
				}
			},
			
			/**
			 * 生成当前变化所进行的初始状态。
			 * @param {Object} from 开始。
			 * @param {Object} to 结束。
			 */
			init: function (options) {
					
				// 对每个设置属性
				var me = this,
					form,
					to,
					key;
					
				// 生成新的 current 对象。
				me.current = {};

				from = this.from || emptyObj;
				to = this.to;
				
				for (key in to) {
					
					var parsed = undefined,
						fromValue = from[key],
						toValue = to[key],
						parser = cache[key = key.toCamelCase()];
					
					// 已经编译过，直接使用， 否则找到合适的解析器。
					if (!parser) {
						
						if(key in Dom.styleNumbers) {
							cache[key] = numberParser;
						} else {
							
							// 尝试使用每个转换器
							for (parser in Animate.parsers) {
								
								// 获取转换器
								parser = Animate.parsers[parser];
								parsed = parser.parse(toValue, key);
								
								// 如果转换后结果合格，证明这个转换器符合此属性。
								if (parsed || parsed === 0) {
									// 缓存，下次直接使用。
									cache[key] = parser;
									break;
								}
							}
							
						}
					}
					
					// 找到合适转换器
					if (parser) {
						me.current[key] = {
							from: parser.parse((fromValue ? fromValue === 'auto' : fromValue !== 0) ? parser.get(me.target, key) : fromValue),
							to: parsed === undefined ? parser.parse(toValue, key) : parsed,
							parser: parser
						};
						
						assert(me.current[key].from !== null && me.current[key].to !== null, "Animate#init(options): 无法正确获取属性 {key} 的值({from} {to})。", key, me.current[key].from, me.current[key].to);
					}
					
				}
				
				return me;
			}
		
		}),

		/**
		 * 缓存已解析的属性名。
		 */
		cache = Animate.props = {
			//opacity: {
			//	set: function (target, name, from, to, delta) {
			//		target.setOpacity(compute(from, to, delta));
			//	},
			//	parse: self,
			//	get: function (target) {
			//		return target.getOpacity();
			//	}
			//},

			scrollTop: {
				set: function (target, name, from, to, delta) {
					target.setScroll(null, compute(from, to, delta));
				},
				parse: self,
				get: function (target) {
					return target.getScroll().y;
				}
			},

			scrollLeft: {
				set: function (target, name, from, to, delta) {
					target.setScroll(compute(from, to, delta));
				},
				parse: self,
				get: function (target) {
					return target.getScroll().x;
				}
			}

		},
		
		numberParser = {
			set: function(target, name, from, to, delta){
				target.dom.style[name] = compute(from, to, delta);
			},
			parse: function(value){
				return typeof value == "number" ? value : parseFloat(value);
			},
			get: function(target, name){
				return Dom.styleNumber(target.dom, name);
			}
		};
	
	Animate.parsers = {
		
		/**
		 * 数字。
		 */
		length: {
			
			set: navigator.isStd ? function (target, name, from, to, delta) {
				
				target.dom.style[name] = compute(from, to, delta) + 'px';
			} : function(target, name, from, to, delta){
				try {
					
					// ie 对某些负属性内容报错
					target.dom.style[name] = compute(from, to, delta);
				}catch(e){}
			},
			
			parse: numberParser.parse,
			
			get: numberParser.get
			
		},
		
		/**
		 * 颜色。
		 */
		color: {
			
			set: function set(target, name, from, to, delta){
				target.dom.style[name] = String.arrayToHex([
					Math.round(compute(from[0], to[0], delta)),
					Math.round(compute(from[1], to[1], delta)),
					Math.round(compute(from[2], to[2], delta))
				]);
			},
			
			parse: function(value){
				return String.hexToArray(value) || String.rgbToArray(value);
			},
			
			get: function(target, name){
				return Dom.getStyle(target.dom, name);
			}
	
		}
		
	};
	
	function self(v){
		return v;
	}
	
	/// #region Dom
	
	var height = 'height marginTop paddingTop marginBottom paddingBottom',
		
		return0 = Function.from(0),
	
		dp = Dom.prototype,
		show = dp.show,
		hide = dp.hide,
		toggle = dp.toggle;
		
	Fx.toggleTypes = {};
		
	Fx.toggleTypes.opacity = Function.from({opacity: 0});

	Object.each({
		all: height + ' opacity width',
		height: height,
		width: 'width marginLeft paddingLeft marginRight paddingRight'
	}, function(value, key){
		value = Object.map(value, return0, {});
		Fx.toggleTypes[key] = function(animate, elem){
			animate.orignal.overflow = elem.style.overflow;
			elem.style.overflow = 'hidden';
			
			return value;
		};
	});
	
	Object.map('left right top bottom', function(key, index){
		Fx.toggleTypes[key] = function(animate, elem, show){
			
			var from = animate.from = {},
				to = animate.to = {};
			
			if(show) {
				to = from;
				from = animate.to;
			}
			
			elem.parentNode.style.overflow = 'hidden';
			if(index <= 1){
				from[key] = -elem.offsetWidth;
				var margin2 = index === 0 ? 'marginRight' : 'marginLeft';
				from[margin2] = elem.offsetWidth;
				to[key] = to[margin2] = 0;
			} else {
				from[key] = -elem.offsetHeight;
				to[key] = 0;
			}
		
		};
		
		key = 'margin' + key.capitalize();
	});

	Dom.implement({
		
		/**
		 * 获取和当前节点有关的 Animate 实例。
		 * @return {Animate} 一个 Animate 的实例。
		 */
		fx: document.fx = function() {
			var data = this.dataField();
			return data.$fx || (data.$fx = new Fx.Animate(this));
		}
		
	}, 2)
	
	.implement({
		
		/**
		 * 变化到某值。
		 * @param {String/Object} [name] 变化的名字或变化的末值或变化的初值。
		 * @param {Object} value 变化的值或变化的末值。
		 * @param {Number} duration=-1 变化的时间。
		 * @param {Function} [oncomplete] 停止回调。
		 * @param {Function} [onStart] 开始回调。
		 * @param {String} link='wait' 变化串联的方法。 可以为 wait, 等待当前队列完成。 rerun 柔和转换为目前渐变。 cancel 强制关掉已有渐变。 ignore 忽视当前的效果。
		 * @return this
		 */
		animate: document.animate = function (params, duration, callback, link) {
			if(params.to){
				link = params.link;
			} else {
				params = {
					target: this,
					to: params,
					duration: duration,
					complete: callback
				};
			}
			
			this.fx().run(params, link);
			
			return this;
		},
		
		/**
		 * 显示当前元素。
		 * @param {Number} duration=500 时间。
		 * @param {Function} [callback] 回调。
		 * @param {String} [type] 方式。
		 * @return {Element} this
		 */
		show: function(){
			var me = this;
			
			// 肯能是同步的请求。
			if (!arguments[0]) {
				return show.apply(me, arguments);
			}

			var args = Dom.initToggleArgs(arguments),
				callback = args[2];
		
			me.fx().run({
				target: this,
				duration: args[1],
				start: function (options) {
					
					var elem = this.target.dom;
						
					if(!Dom.isHidden(elem)){
						if (callback)
							callback.call(this.target, true, true);
						return false;
					}
					
					Dom.show(elem);
					
					this.orignal = {};
					
					var from = Fx.toggleTypes[args[0]](this, elem, false);
					
					if(from){
						this.from = from;
						this.to = {};	
							
						for(from in this.from) {
							this.to[from] = Dom.styleNumber(elem, from);
						}
					}
					
					for(from in this.to){
						this.orignal[from] = elem.style[from];
					}
				},
				complete:  function(){
					Object.extend(this.target.dom.style, this.orignal);
				
					if (callback)
						callback.call(this.target, true);
				}
			}, args[3]);
		
			return me;
		},
		
		/**
		 * 隐藏当前元素。
		 * @param {Number} duration=500 时间。
		 * @param {Function} [callback] 回调。
		 * @param {String} [type] 方式。
		 * @return {Element} this
		 */
		hide: function () {
			var me = this;
			
			// 肯能是同步的请求。
			if (!arguments[0]) {
				return hide.apply(me, arguments);
			}

			var args = Dom.initToggleArgs(arguments),
				callback = args[2];
		
			me.fx().run({
				duration: args[1],
				start: function () {
					
					var elem = this.target.dom;
						
					if(Dom.isHidden(elem)){
						if(callback)
							callback.call(this.target, false, true);
						return false;
					}
					
					this.orignal = {};
					
					var to = Fx.toggleTypes[args[0]](this, elem, true);
					
					if(to){
						this.from = null;
						this.to = to;
					}
					
					for(var i in this.to){
						this.orignal[i] = elem.style[i];
					}
				},
				complete: function () {
					
					var elem = this.target.dom;
					Object.extend(elem.style, this.orignal);
					Dom.hide(elem);
					if (callback)
						callback.call(this.target, false);
				}
			}, args[3]);
			
			return this;
		},
	
		toggle: function(){
			var me = this;
			me.fx().then(function (args) {
				toggle.apply(me, args);
				return false;
			}, arguments);

			return me;
		},
		
		/**
		 * 高亮元素。
		 * @param {String} color 颜色。
		 * @param {Function} [callback] 回调。
		 * @param {Number} duration=500 时间。
		 * @return this
		 */
		highlight: function(color, duration, callback){
			assert(!callback || Object.isFunction(callback), "Dom#highlight(color, duration, callback): 参数 {callback} 不是可执行的函数。", callback);
			var from = {},
				to = {
					backgroundColor: color || '#ffff88'
				},
				fx = this.fx();
			
			fx.run({
				target: this,
				from: from,
				to: to,
				duration: duration,
				start: function(){
					this.from.backgroundColor = Dom.getStyle(this.target.dom, 'backgroundColor');
				}
			}).run({
				target: this,
				from: to,
				to: from,
				duration: duration,
				stop: callback
			});
			
			return this;
		}
	
	});
	
				

	/// #endregion
	
})();
