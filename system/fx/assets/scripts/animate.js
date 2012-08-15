/**
 * @fileOverview 通过改变CSS实现的变换。
 * @author xuld
 */


using("System.Dom.Base");
using("System.Fx.Tween");

 

(function(){
	
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
		 * 获取和当前节点有关的 Tween 实例。
		 * @return {Animate} 一个 Tween 的实例。
		 */
		fx: document.fx = function() {
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
		animate: document.animate = function (params, duration, oncomplete, onstart, link) {
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
		show: function(){
			var me = this;
			
			// 肯能是同步的请求。
			if (!arguments[0]) {
				return show.apply(me, arguments);
			}

			var args = Dom.initToggleArgs(arguments),
				callback = args[2];
		
			me.fx().run({
				target: me,
				duration: args[1],
				start: function (tweens, fx) {
					
					var elem = this.node;
						
					if(!Dom.isHidden(elem)){
						if (callback)
							callback.call(this, true, true);
						return false;
					}
					
					Dom.show(elem);
					
					fx.orignal = {};
					
					var from = Fx.toggleTypes[args[0]](this, elem, false);
					
					if(from){
						fx.tweens = {};	
							
						for(from in tweens) {
							fx.tweens[from] = Dom.styleNumber(elem, from);
						}
					}
					
					for(from in fx.tweens){
						fx.orignal[from] = elem.style[from];
					}
				},
				complete:  function(isAbort, fx){
					Object.extend(this.node.style, fx.orignal);
				
					if (callback)
						callback.call(this, false, isAbort);
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
				target: me,
				duration: args[1],
				start: function (tweens, fx) {
					
					var elem = this.node;
						
					if(Dom.isHidden(elem)){
						if(callback)
							callback.call(this, false, true);
						return false;
					}
					
					this.orignal = {};
					
					var to = Fx.toggleTypes[args[0]](this, elem, true);
					
					if(to){
						fx.tweens = to;
					}
					
					for(var i in tweens){
						fx.orignal[i] = elem.style[i];
					}
				},
				complete: function (isAbort, fx) {
					
					var elem = this.node;
					Object.extend(elem.style, fx.orignal);
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
		}
	
	});
	
				

	/// #endregion
	
})();
