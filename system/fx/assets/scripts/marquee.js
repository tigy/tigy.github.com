



using("System.Fx.Animate");
using("System.Dom.Base");

var Marquee = Class({
	
	/**
	 * 每次滚动的效果时间。
	 */
	duration:-1,
	
	/**
	 * 自动滚动的延时时间。
	 */
	delay: 3000,

	/**
	 * 移动的方向。
	 * @config
	 */
	direction: 'left',

	/**
	 * 每次移动的张数。
	 * @config
	 */
	delta: 1,

	/**
	 * 是否循环播放。
	 * @config
	 */
	loop: true,
	
	_currentIndex: 0,
	
	/**
	 * 是否循环。
	 * @property {Boolean} loop
	 */
	
	_getWidthBefore: function(ctrl, xy){
		return ctrl && (ctrl = ctrl.prev()) ? Dom.calc(ctrl.dom, xy) + this._getWidthBefore(ctrl, xy) : 0;
	},
	
	_getScrollByIndex: function (value) {
		return this._getWidthBefore(this.target.first(value), this._horizonal ? 'mx+sx' : 'my+sy');
	},
	
	_getTotalSize: function(){
		var size = 0;
		var xy = this._horizonal ? "mx+sx" : "my+sy";
		this.target.children().each(function (child) {
			size += Dom.calc(child, xy);
		});
		return size;
	},

	/**
	 * 内部实现移动到指定位置的效果。
	 */
	_animateToWithoutLoop: function (index, lt) {

		var me = this,
			oldIndex = me._fixIndex(me._currentIndex),
			obj;

		if (me.onChanging(index, oldIndex) !== false) {

			// 暂停自动播放，防止出现抢资源问题。
			me.pause();

			// 记录当前正在转向的目标索引。
			me._currentIndex = index;

			// 计算滚动坐标。

			obj = {};
			obj[me._horizonal ? 'marginLeft' : 'marginTop'] = -me._getScrollByIndex(index);
			me.target.animate(obj, me.duration, function () {

				// 滚动完成后触发事件。
				me.onChanged(index, oldIndex);

				// 如果本来正在自动播放中，这里恢复自动播放。
				if (me.step)
					me.resume();
			}, 'abort');
		}

	},

	/**
	 * 内部实现移动到指定位置的效果。
	 */
	_animateToWithLoop: function (index, lt, allowBack) {

		var me = this,
			oldIndex = me._fixIndex(me._currentIndex),
			obj;

		if (me.onChanging(index, oldIndex) !== false) {

			// 暂停自动播放，防止出现抢资源问题。
			me.pause();

			// 计算滚动坐标。

			obj = {
				from: {},
				to: {},
				duration: me.duration,
				start: function () {

					// 实际所滚动的区域。
					var actualIndex = index + me.length,
						prop = me._horizonal ? 'marginLeft' : 'marginTop',
						from = Dom.styleNumber(me.target.dom, prop),
						to = -me._getScrollByIndex(actualIndex);

					if (!allowBack) {

						// 如果是往上、左方向滚。
						if (lt) {

							// 确保 from > to
							if (from > to) {
								from -= me._size;
							}

						} else {

							// 确保 from < to
							if (from < to) {
								from += me._size;
							}
						}

					}

					obj.from[prop] = from;
					obj.to[prop] = to;

					// 记录当前正在转向的目标索引。
					me._currentIndex = index;
				},
				complete: function () {

					// 效果结束。
					me._animatingTargetIndex = null;

					// 滚动完成后触发事件。
					me.onChanged(index, oldIndex);

					// 如果本来正在自动播放中，这里恢复自动播放。
					if (me.step)
						me.resume();
				},
				link: 'abort'
			};

			
			me.target.animate(obj);
		}
		return this;

	},

	_fixIndex: function (index) {
		return index = index >= 0 ? index % this.length : index + this.length;
	},
	
	onChanging: function (newIndex, oldIndex) {
		return !this.disabled && this.trigger('changing', {
			from: oldIndex,
			to: newIndex
		});
	},
	
	onChanged: function(newIndex, oldIndex){
		this.trigger('changed', {
			from: oldIndex,
			to: newIndex
		});
	},

	/**
	 * 更新节点状态。
	 */
	update: function () {
		var children = this.target.children(),
			size,
			xy = this._horizonal ? 'Width' : 'Height';
		
		if (!this.cloned) {

			// 设置大小。
			this.length = children.length;

			// 如果不需要滚动，自动设为 disabled 属性。
			this.disabled = this.target.parent()['get' + xy]() >= size;
			//  this.disabled = this.target.getScrollSize()[this._horizonal ? 'x' : 'y'] > size;

			if (!this.disabled && this.loop) {
				children.clone().appendTo(this.target);
				children.clone().appendTo(this.target);
				this.cloned = true;
			}
		}

		size = this._getTotalSize();
		this._size = this.cloned ? size / 3 : size;
		
		this.target['set' + xy](size);
		this.set(this._currentIndex);
	},

	pause: function () {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = 0;
		}

	},

	resume: function () {
		if (!this.timer) {
			this.timer = setTimeout(this.step, this.delay);
		}
	},

	constructor: function (dom, direction, loop, deferUpdate) {
		dom = Dom.get(dom);
		this.target = dom.find('ul') || dom;
		this.target.parent().setStyle('overflow', 'hidden');

		if (loop === false) {
			this.loop = false;
		}

		this.setDirection(direction || this.direction);

		this.update();

		// Chrome 无法直接获取图片大小。
		if (deferUpdate !== false && !Dom.isLoaded) {
			Dom.load(this.update.bind(this));
		}
	},
	
	/**
	 * 暂停滚动
	 * @method pause
	 */
	stop: function() {
		clearInterval(this.timer);
		this.timer = 0;
		this.step = null;
		return this;
	},

	setDirection: function (direction) {
		this.direction = direction;
		this._lt = /^[rb]/.test(direction);
		this._horizonal = /^[lr]/.test(direction);
	},
	
	/**
	 * (重新)开始滚动
	 * @method start
	 */
	start: function (delta) {
		var me = this.stop();
		delta = delta || me.delta;
		if (delta < 0) {
			me._lt = !me._lt;
			delta = -delta;
		}

		if (me._lt) {
			delta = -delta;
		}

		// 设置单步的执行函数。
		me.step = function() {
			var index = me._currentIndex + delta;
			index = me._fixIndex(index);
			me[me.loop ? '_animateToWithLoop' : '_animateToWithoutLoop'](index, me._lt);
			me.timer = setTimeout(me.step, me.delay)
		};

		// 正式开始。
		me.resume();
		
		return me;
	},

	set: function (index) {
		index = this._fixIndex(index);
		if (this.loop) {
			index += this.length;
		}
		this.target.setStyle(this._horizonal ? 'marginLeft' : 'marginTop', -this._getScrollByIndex(index));
		this.onChanged(index, this._currentIndex);
		this._currentIndex = index;
		return this;
	},

	moveTo: function (index, lt) {
		index = this._fixIndex(index);
		this[this.loop ? '_animateToWithLoop' : '_animateToWithoutLoop'](index, lt === undefined ? this._lt : lt, true);
		return this;
	},

	moveBy: function (index) {
		return this.moveTo(this._currentIndex + index % this.length, index < 0);
	},

	prev: function () {
		return this.moveTo(this._currentIndex - 1, false);
	},

	next: function () {
		return this.moveTo(this._currentIndex + 1, true);
	}
	
});