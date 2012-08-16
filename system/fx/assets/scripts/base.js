/**
 * @fileOverview 提供底层的 特效算法支持。
 * @author xuld
 */

using("System.Utils.Deferrable");

/**
 * 特效算法基类。
 * @class Fx
 * @extends Deferrable
 * @abstract
 */
var Fx = (function() {
	
	
	/// #region interval
	
	var cache = {};
	
	/**
	 * 定时执行的函数。
	 */
	function interval(){
		var i = this.length;
		while(--i >= 0)
			this[i].step();
	}
	
	/// #endregion
		
	return Deferrable.extend({

		/**
		 * 当前绑定的节点。
		 * @type Dom
		 * @protected
		 */
		target: null,
	
		/**
		 * 每秒的运行帧次。
		 * @type {Number}
		 */
		fps: 50,
		
		/**
		 * 特效执行毫秒数。
		 * @type {Number}
		 */
		duration: 300,

		/**
		 * 用于实现渐变曲线的计算函数。函数的参数为：
		 *
		 * - @param {Object} p 转换前的数值，0-1 之间。
		 *
		 * 返回值是一个数字，表示转换后的值，0-1 之间。
		 * @field
		 * @type Function
		 * @remark
		 */
		transition: function(p) {
			return -(Math.cos(Math.PI * p) - 1) / 2;
		},
		
		/**
		 * 当被子类重写时，实现生成当前变化所进行的初始状态。
		 * @param {Object} from 开始位置。
		 * @param {Object} to 结束位置。
		 * @return {Base} this
		 */
		init: Function.empty,
		
		/**
		 * @event step 当进度改变时触发。
		 * @param {Number} value 当前进度值。
		 */
		
		/**
		 * 根据指定变化量设置值。
		 * @param {Number} delta 变化量。 0 - 1 。
		 * @abstract
		 */
		set: Function.empty,
		
		/**
		 * 进入变换的下步。
		 */
		step: function() {
			var me = this, time = Date.now() - me.time;
			if (time < me.duration) {
				me.set(me.transition(time / me.duration));
			}  else {
				me.end(false);
			}
		},
		
		/**
		 * 开始运行特效。
		 * @param {Object} from 开始位置。
		 * @param {Object} to 结束位置。
		 * @param {Number} duration=-1 变化的时间。
		 * @param {Function} [onStop] 停止回调。
		 * @param {Function} [onStart] 开始回调。
		 * @param {String} link='wait' 变化串联的方法。 可以为 wait, 等待当前队列完成。 restart 柔和转换为目前渐变。 cancel 强制关掉已有渐变。 ignore 忽视当前的效果。
		 * @return {Base} this
		 */
		run: function (options, link) {
			var fx = this, defaultOptions, duration;
			if (!fx.defer(options, link)) {

				assert.notNull(options, "Fx#run(options, link): {options} ~");

				// options
				fx.options = options;

				// start
				if (options.start && options.start.call(options.target, options, fx) === false) {
					fx.progress();
				} else {

					defaultOptions = Fx.prototype;

					// transition
					fx.transition = options.transition || defaultOptions.transition;

					// target
					fx.target = options.target;
				
					// duration
					duration = options.duration;
					assert(duration == undefined || duration === 0 || +duration, "Fx#run(options, link): duration 必须是数字。如果需要使用默认的时间，使用 -1 。");
					fx.duration = duration !== -1 && duration != undefined ? duration < 0 ? -defaultOptions.duration * duration : fx.duration : defaultOptions.duration;

					fx.init(options);
					fx.set(0);
					fx.time = 0;
					fx.resume();
				}
			}

			return fx;
		},

		/**
		 * 由应用程序通知当前 Fx 对象特效执行完。
		 * @param {Boolean} isAbort 如果是强制中止则为 true, 否则是 false 。
		 */
		end: function(isAbort) {
			var fx = this;
			fx.pause();
			fx.set(1);
			try {
				if (fx.options.complete) {
					fx.options.complete.call(fx.target, isAbort, fx);
				}
			} finally {
				fx.progress();
			}
			return fx;
		},
		
		/**
		 * 中断当前效果。
		 */
		stop: function() {
			this.abort();
			this.end(true);
			return this;
		},
		
		/**
		 * 暂停当前效果。
		 */
		pause: function() {
			var me = this;
			if (me.timer) {
				me.time = Date.now() - me.time;
				var fps = me.fps, value = cache[fps];
				value.remove(me);
				if (value.length === 0) {
					clearInterval(me.timer);
					delete cache[fps];
				}
				me.timer = 0;
			}
			return me;
		},
		
		/**
		 * 恢复当前效果。
		 */
		resume: function() {
			var me = this;
			if (!me.timer) {
				me.time = Date.now() - me.time;
				var fps = me.fps, value = cache[fps];
				if(value){
					value.push(me);
					me.timer = value[0].timer;
				} else {
					me.timer = setInterval(interval.bind(cache[fps] = [me]), Math.round(1000 / fps ));
				}
			}
			return me;
		}
		
	});
	

})();
