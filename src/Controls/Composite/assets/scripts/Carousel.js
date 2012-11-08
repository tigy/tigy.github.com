/**
 * @author 
 */


imports("Controls.Composite.Carousel");
using("System.Fx.Marquee");


var Carousel = Control.extend({
	
	onChange: function (e) {
		var ul = this.find('.x-carousel-header'), t;
		if (t = ul.first(e.from))
			t.removeClass('x-carousel-header-selected');
			
		if(t = ul.first(e.to))
			t.addClass('x-carousel-header-selected');
		
	},
	
	init: function (options) {
		var me = this;
		me.marquee = new Marquee(me, options.direction, options.loop, options.deferUpdate);
		if (options.duration != null)
			me.marquee.duration = options.duration;
		if (options.delay != null)
			me.marquee.delay = options.delay;
		me.marquee.on('changing', me.onChange, me);
		me.query('.x-carousel-header > li').setWidth(me.getWidth() / me.marquee.length).on(options.event || 'mouseover', function (e) {
			me.marquee.moveTo(this.index());
		});
		me.onChange({to: 0});
		
		me.marquee.start();
	}

}).defineMethods("marquee", "moveTo moveBy start stop");