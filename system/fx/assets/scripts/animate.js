/**
 * @fileOverview 通过改变CSS实现的变换。
 * @author xuld
 */


using("System.Dom.Base");
using("System.Fx.Tween");

 

(function(){
	
	var displayEffects = Fx.displayEffects = {
			opacity: Function.from({
				opacity: 0
			})
		},

		toggle = Dom.prototype.toggle,

		shift = Array.prototype.shift,
		
		height = 'height marginTop paddingTop marginBottom paddingBottom';

	Object.each({
		all: height + ' opacity width',
		height: height,
		width: 'width marginLeft paddingLeft marginRight paddingRight'
	}, function(value, key){
		value = Object.map(value, this, {});
		displayEffects[key] = function(fx, elem, isShow) {

			// 修复 overflow 。
			fx.orignal.overflow = elem.style.overflow;
			elem.style.overflow = 'hidden';

			// inline 元素不支持 修改 width 。
			if (Dom.styleString(elem, 'display') === 'inline') {
				fx.orignal.display = elem.style.display;
				elem.style.display = 'inline-block';
			}
			
			return value;
		};
	}, Function.from(0));
	
	Object.map('left right top bottom', function(key, index) {
		key = 'margin' + key.capitalize();
		return function(fx, elem, isShow) {

			// 将父元素的 overflow 设为 hidden 。
			elem.parentNode.style.overflow = 'hidden';

			var tweens = {},
				currentValue,
				key2;
			
			if(index <= 1){
				currentValue = -elem.offsetHeight - Dom.styleNumber(elem, key);
				tweens[key] = isShow ? (currentValue + '-0') : ('0-' + currentValue);

				key2 = index === 0 ? 'marginRight' : 'marginLeft';
				currentValue = -elem.offsetHeight - Dom.styleNumber(elem, key2);
				tweens[key2] = isShow ? (currentValue + '-0') : ('0-' + currentValue);

			} else {
				currentValue = -elem.offsetHeight - Dom.styleNumber(elem, key);
				tweens[key] = isShow ? (currentValue + '-0') : ('0-' + currentValue);
			}

			return tweens;
		
		};
		
	}, displayEffects);

	Dom.implement({
		
		/**
		 * 获取和当前节点有关的 Tween 实例。
		 * @return {Animate} 一个 Tween 的实例。
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
		 * @param {Object} value 变化的值或变化的末值。
		 * @param {Number} duration=-1 变化的时间。
		 * @param {Function} [oncomplete] 停止回调。
		 * @param {Function} [onStart] 开始回调。
		 * @param {String} link='wait' 变化串联的方法。 可以为 wait, 等待当前队列完成。 rerun 柔和转换为目前渐变。 cancel 强制关掉已有渐变。 ignore 忽视当前的效果。
		 * @return this
		 */
		animate: function (params, duration, oncomplete, onstart, link) {
			if(typeof duration === 'object'){
				link = duration.link;
				oncomplete = duration.complete;
				onstart = duration.start;
				duration = duration.duration;
			}
			
			this.fx().run( {
				target: this,
				tweens: params,
				start: onstart,
				duration: duration,
				complete: oncomplete
			}, link);
			
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
			if (args.length === 0) {
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
							tweens,
							tween;

						// 如果元素本来就是显示状态，则不执行后续操作。
						if (!Dom.isHidden(elem)) {
							if (callback)
								callback.call(this, true, true);
							return false;
						}

						// 首先显示元素。
						Dom.show(elem);

						// 保存原有的值。
						fx.orignal = {};

						// 获取指定特效实际用于展示的css字段。
						options.tweens = tweens = Fx.displayEffects[effect](fx, elem, false);

						// 保存原有的css值。
						// 用于在hide的时候可以正常恢复。
						for (tween in tweens) {
							fx.orignal[tween] = elem.style[tween];
						}

						// 因为当前是显示元素，因此将值为 0 的项修复为当前值。
						for (tween in tweens) {
							if (tweens[tween] === 0) {

								// 设置变化的目标值。
								tweens[tween] = Dom.styleNumber(elem, tween);

								// 设置变化的初始值。
								elem.style[tween] = 0;
							}
						}
					},
					complete: function(isAbort, fx) {

						// 拷贝回默认值。
						Object.extend(this.node.style, fx.orignal);

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
			if (args.length === 0) {
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
							tweens,
							tween;

						// 如果元素本来就是隐藏状态，则不执行后续操作。
						if (Dom.isHidden(elem)) {
							if (callback)
								callback.call(this, false, true);
							return false;
						}

						// 保存原有的值。
						fx.orignal = {};

						// 获取指定特效实际用于展示的css字段。
						options.tweens = tweens = Fx.displayEffects[effect](fx, elem, true);

						// 保存原有的css值。
						// 用于在show的时候可以正常恢复。
						for (tween in tweens) {
							fx.orignal[tween] = elem.style[tween];
						}
					},
					complete: function(isAbort, fx) {

						var elem = this.node;

						// 最后显示元素。
						Dom.hide(elem);

						// 恢复所有属性的默认值。
						Object.extend(elem.style, fx.orignal);

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

/// TODO: clear

document.animate = function() {
	assert.deprected("document.animate 已过时，请改用 Dom.get(document).animate。");
	var doc = Dom.get(document);
	doc.animate.apply(doc, arguments);
	return this;
};

/// TODO: clear
