/**
 * @author xuld
 */


imports("Controls.Composite.Carousel");
using("System.Fx.Animate");
using("Controls.Core.Base");


var Carousel = Control.extend({
	
	onChange: function (from, to) {
		var ul = this.find('.x-carousel-header'), t;
		if (t = ul.child(from))
			t.removeClass('x-carousel-selected');
			
		if (t = ul.child(to))
			t.addClass('x-carousel-selected');
		
	},

    /**
     * 当前标题正在显示的索引。
     */
	currentIndex: 0,

    duration: -1,

    /**
	 * 自动滚动的延时时间。
	 */
	delay: 4000,
	
	init: function (options) {

	    var me = this,
            width = me.getWidth(),
            children = me.children = me.query('.x-carousel-body > li').hide();

	    me.query('.x-carousel-header > li').setWidth(width / children.length).on(options.event || 'mouseover', function (e) {
	        me.moveTo(this.index());
	    });

	    children.item(0).show();
	    me.onChange(null, 0);

	    me.start();
	},

	_slideTo: function (fromIndex, toIndex, ltr) {

	    var me = this,
            body = me.find('.x-carousel-body'),
            width = me.getWidth();

	    // 如果正在执行渐变，则记录 toIndex 为 finalIndex 。当前特效执行结束后回调函数继续处理 oldIndex 。
	    if (me.animatingIndex == null) {

	        // 如果目前没有执行特效。记录当前正在渐变到指定的索引。下次执行函数时，可以监测到当前正在执行渐变。
	        me.animatingIndex = toIndex;

	        me.children.hide();

	        // 如果需要从左渐变至右。
	        if (!ltr) {
	            width = -width;
	        }

	        me.children.item(fromIndex).show().node.style.left = 0;
	        me.children.item(toIndex).show().node.style.left = width + 'px';

	        body.animate({
	            left: '0-' + -width
	        }, this.duration, function () {

	            var animatingIndex = me.animatingIndex;
	            var finalIndex = me.finalIndex;

	            // 效果执行完成。
	            me.animatingIndex = null;

	            // 如果正在执行特效时又重新执行了 _slideTo 则 finalIndex 非空。
	            if (finalIndex != null && finalIndex !== animatingIndex) {
	                me.finalIndex = null;
	                me._slideTo(animatingIndex, finalIndex, animatingIndex < finalIndex);
	            }
	        });

	    } else {
	        me.finalIndex = toIndex;
	    }

	    return toIndex;

	},

	moveTo: function (index, ltr) {

	    var timer = this.timer,
	        currentIndex = this.currentIndex;

	    if (timer) {
	        clearTimeout(timer);
	    }

	    if (index != currentIndex) {
	        index %= this.children.length;
	        this.currentIndex = index;
	        this.onChange(currentIndex, index);
	        this._slideTo(currentIndex, index, ltr || currentIndex < index);
	    }

	    if (timer) {
	        this.timer = setTimeout(this.step, this.delay);
	    }

	    return this;

	},

	moveBy: function (delta) {
	    return this.moveTo(this.currentIndex + delta);
	},

	prev: function () {
	    return this.moveBy(-1);
	},

	next: function () {
	    return this.moveBy(1);
	},

	start: function () {
	    var me = this;
	    if (!me.timer) {
	        me.step = function () {
	            me.moveTo(me.currentIndex + 1, true);
	        }
	        me.timer = setTimeout(me.step, me.delay);
	    }
	    return me;
	},

	stop: function () {
	    if (this.timer) {
	        clearTimeout(this.timer);
	        this.timer = 0;
	    }
	    return this;
	}

});

