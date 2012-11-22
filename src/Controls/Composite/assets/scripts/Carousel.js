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
     * ��ǰ����������ʾ��������
     */
	currentIndex: 0,

    duration: -1,

    /**
	 * �Զ���������ʱʱ�䡣
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

	    // �������ִ�н��䣬���¼ toIndex Ϊ finalIndex ����ǰ��Чִ�н�����ص������������� oldIndex ��
	    if (me.animatingIndex == null) {

	        // ���Ŀǰû��ִ����Ч����¼��ǰ���ڽ��䵽ָ�����������´�ִ�к���ʱ�����Լ�⵽��ǰ����ִ�н��䡣
	        me.animatingIndex = toIndex;

	        me.children.hide();

	        // �����Ҫ���󽥱����ҡ�
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

	            // Ч��ִ����ɡ�
	            me.animatingIndex = null;

	            // �������ִ����Чʱ������ִ���� _slideTo �� finalIndex �ǿա�
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

	    return this.start();

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

