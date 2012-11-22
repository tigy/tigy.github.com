/**
 * @author xuld
 */


using("System.Fx.Tween");


(function(){
	
    var opacity0 = {
            opacity: 0
        },

        displayEffects = Fx.displayEffects = {
            opacity: function () {
                return opacity0;
            }
		},

		toggle = Dom.prototype.toggle,

		shift = Array.prototype.shift,
		
		height = 'height marginTop paddingTop marginBottom paddingBottom';

	function fixProp(options, elem, prop) {
		options.orignal[prop] = elem.style[prop];
		elem.style[prop] = Dom.styleNumber(elem, prop) + 'px';
	}

	Object.each({
		all: height + ' opacity width',
		height: height,
		width: 'width marginLeft paddingLeft marginRight paddingRight'
	}, function(value, key){
		value = Object.map(value, this, {});

		displayEffects[key] = function(options, elem, isShow) {

			// 修复 overflow 。
			options.orignal.overflow = elem.style.overflow;
			elem.style.overflow = 'hidden';

			// inline 元素不支持 修改 width 。
			if (Dom.styleString(elem, 'display') === 'inline') {
				options.orignal.display = elem.style.display;
				elem.style.display = 'inline-block';
			}

			// 如果是 width, 固定 height 。
			if (key === 'height') {
				fixProp(options, elem, 'width');
			} else if (key === 'width') {
				fixProp(options, elem, 'height');
			}
			
			return value;
		};
	}, function () {
	    return 0;
	});
	
	Object.map('left right top bottom', function(key, index) {
		key = 'margin' + key.capitalize();
		return function(options, elem, isShow) {

			// 将父元素的 overflow 设为 hidden 。
			elem.parentNode.style.overflow = 'hidden';

			var params = {},
				fromValue,
				toValue,
				key2,
				delta;
			
			if (index <= 1) {
				key2 = index === 0 ? 'marginRight' : 'marginLeft';
				fromValue = -elem.offsetWidth - Dom.styleNumber(elem, key2);
				toValue = Dom.styleNumber(elem, key);
				params[key] = isShow ? (fromValue + '-' + toValue) : (toValue + '-' + fromValue);

				fixProp(options, elem, 'width');
				delta = toValue - fromValue;
				toValue = Dom.styleNumber(elem, key2);
				fromValue = toValue + delta;
				params[key2] = isShow ? (fromValue + '-' + toValue) : (toValue + '-' + fromValue);

			} else {
				key2 = index === 2 ? 'marginBottom' : 'marginTop';
				fromValue = -elem.offsetHeight - Dom.styleNumber(elem, key2);
				toValue = Dom.styleNumber(elem, key);
				params[key] = isShow ? (fromValue + '-' + toValue) : (toValue + '-' + fromValue);
			}

			return params;
		
		};
		
	}, displayEffects);

	Dom.implement({
		
		/**
		 * 获取和当前节点有关的 param 实例。
		 * @return {Animate} 一个 param 的实例。
		 */
		fx: function() {
			var data = this.dataField();
			return data.$fx || (data.$fx = new Fx.Tween());
		}
		
	}, 2)
	
	.implement({
		
		/**
		 * 变化到某值。
		 * @param {String/Object} [name] 变化的名字或变化的末值或变化的初值。
		 * @param {Number} duration=-1 变化的时间。
		 * @param {Function} [oncomplete] 停止回调。
		 * @param {String} link='wait' 变化串联的方法。 可以为 wait, 等待当前队列完成。 rerun 柔和转换为目前渐变。 cancel 强制关掉已有渐变。 ignore 忽视当前的效果。
		 * @return this
		 */
		animate: function (params, duration, oncomplete, link) {
			assert.notNull(params, "Dom#animate(params, duration, oncomplete, link): {params} ~", params);
				
			if(params.params){
				link = params.link;
			} else {
				params = {
					params: params,
					duration: duration,
					complete: oncomplete
				};
			}
			
			params.target = this;

			assert(!params.duration || typeof params.duration === 'number', "Dom#animate(params, duration, oncomplete, link): {duration} 必须是数字。如果需要制定为默认时间，使用 -1 。", params.duration);
			assert(!params.oncomplete || typeof params.oncomplete === 'function', "Dom#animate(params, duration, oncomplete, link): {oncomplete} 必须是函数", params.oncomplete);
			
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
		show: function() {
			var me = this,
				args = arguments,
				callback,
				effect;

			// 如果没有参数，直接隐藏。
			if (typeof args[0] !== 'number') {
				Dom.show(me.node);
			} else {

				// 如果第一个参数是字符串。则表示是显示类型。
				effect = typeof args[0] === 'string' ? shift.call(args) : 'opacity';
				assert(Fx.displayEffects[effect], "Dom#show(effect, duration, callback, link): 不支持 {effect} 。", effect);
				callback = args[1];

				me.fx().run({
					target: me,
					duration: args[0],
					start: function(options, fx) {

						var elem = this.node,
							t,
							params,
							param;

						// 如果元素本来就是显示状态，则不执行后续操作。
						if (!Dom.isHidden(elem)) {
							if (callback)
								callback.call(this, true, true);
							return false;
						}

						// 首先显示元素。
						Dom.show(elem);

						// 保存原有的值。
						options.orignal = {};

						// 新建一个新的 params 。
						options.params = params = {};

						// 获取指定特效实际用于展示的css字段。
						t = Fx.displayEffects[effect](options, elem, true);

						// 保存原有的css值。
						// 用于在hide的时候可以正常恢复。
						for (param in t) {
							options.orignal[param] = elem.style[param];
						}

						// 因为当前是显示元素，因此将值为 0 的项修复为当前值。
						for (param in t) {
							if (t[param] === 0) {

								// 设置变化的目标值。
								params[param] = Dom.styleNumber(elem, param);

								// 设置变化的初始值。
								elem.style[param] = 0;
							} else {
								params[param] = t[param];
							}
						}
					},
					complete: function(isAbort, fx) {

						// 拷贝回默认值。
						Object.extend(this.node.style, fx.options.orignal);

						if (callback)
							callback.call(this, false, isAbort);
					}
				}, args[2]);

			}
		
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
			var me = this,
				args = arguments,
				callback,
				effect;
			
			// 如果没有参数，直接隐藏。
			if (typeof args[0] !== 'number') {
				Dom.hide(me.node);
			} else {

				// 如果第一个参数是字符串。则表示是显示类型。
				effect = typeof args[0] === 'string' ? shift.call(args) : 'opacity';
				assert(Fx.displayEffects[effect], "Dom#hide(effect, duration, callback, link): 不支持 {effect} 。", effect);
				callback = args[1];

				me.fx().run({
					target: me,
					duration: args[0],
					start: function(options, fx) {

						var elem = this.node,
							params,
							param;

						// 如果元素本来就是隐藏状态，则不执行后续操作。
						if (Dom.isHidden(elem)) {
							if (callback)
								callback.call(this, false, true);
							return false;
						}

						// 保存原有的值。
						options.orignal = {};

						// 获取指定特效实际用于展示的css字段。
						options.params = params = Fx.displayEffects[effect](options, elem, false);

						// 保存原有的css值。
						// 用于在show的时候可以正常恢复。
						for (param in params) {
							options.orignal[param] = elem.style[param];
						}
					},
					complete: function(isAbort, fx) {

						var elem = this.node;

						// 最后显示元素。
						Dom.hide(elem);

						// 恢复所有属性的默认值。
						Object.extend(elem.style, fx.options.orignal);

						// callback
						if (callback)
							callback.call(this, false, isAbort);
					}
				}, args[2]);

			}
			
			return this;
		},
	
		toggle: function(){
			var me = this;
			me.fx().then(function (args) {
				toggle.apply(me, args);
				return false;
			}, arguments);

			return me;
		}
	
	});
	
})();
