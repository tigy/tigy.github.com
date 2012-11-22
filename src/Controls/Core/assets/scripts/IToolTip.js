/**
 * @author xuld
 */


using("System.Dom.Align");


var IToolTip = {
	
	menuTpl: '<span>\
	    <span class="x-arrow-fore">◆</span>\
        <span class="x-arrow-back">◆</span>\
    </span>',
    /**
	 * 显示时使用的特效持续时间。
	 */	showDuration: -2,	show: function () {
	    if (!this.closest('body')) {
	        this.appendTo();
	    }	    Dom.prototype.show.apply(this, arguments);

	    return this;
	},	showAt: function (x, y) {
	    return this.show(this.showDuration).setPosition(x, y);
	},	showBy: function (ctrl, offsetX, offsetY, e) {
			    var configs = ({
	        left: ['rr-yc', 15, 0],	        right: ['ll-yc', 15, 0],	        top: ['xc-bb', 0, 15],	        bottom: ['xc-tt', 0, 15],	        'null': ['xc-bb', 0, 5]
	    }[this.getArrow()]);	    this.show(this.showDuration).align(ctrl, configs[0], offsetX === undefined ? configs[1] : offsetX, offsetY === undefined ? configs[2] : offsetY);
		
		if(e){
			this.setPosition(e.pageX + (offsetX || 0));
		}

		return this;
	},	close: function () {	    return this.hide(this.showDuration);	},	setArrow: function (value) {
	    var arrow = this.find('.x-arrow') || this.append(this.menuTpl);
	    if (value) {
	        arrow.node.className = 'x-arrow x-arrow-' + value;
	    } else {
	        arrow.remove();
	    }	    return this;
	},	getArrow: function () {
	    var arrow = this.find('.x-arrow'), r = null;	    if (arrow) {
	        r = (/\bx-arrow-(top|bottom|left|right)/.exec(arrow.node.className) || [0, r])[1];
	    }	    return r;
	},
	
    /**
     * 设置某个控件工具提示。
     */
	setToolTip: function (ctrl, caption, offsetX, offsetY) {
	    ctrl = Dom.get(ctrl);

	    var me = this;
	    ctrl.on('mouseover', function (e) {
	        var waitTimeout = me.isHidden() ? me.initialDelay : me.reshowDelay;
	        if (me.showTimer)
	            clearTimeout(me.showTimer);

	        me.showTimer = setTimeout(function () {
	            me.showTimer = 0;

	            if (caption)
	                me.setText(caption);

	            me.showBy(ctrl, offsetX, offsetY, e);
	        }, waitTimeout);

	    }, this);
		
	    ctrl.on('mouseout', function () {
	        if (me.showTimer) {
	            clearTimeout(me.showTimer);
	        }

	        this.close();
	    }, this);
		
		
	    return this;
		
	}
	
};
