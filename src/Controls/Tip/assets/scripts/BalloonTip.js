/** * @author xuld */imports("Controls.Tip.BalloonTip");using("System.Dom.Align");using("Controls.Core.ContainerControl");using("Controls.Core.IToolTip");/** * @class * @extends Control */var BalloonTip = ContainerControl.extend(IToolTip).implement({	    xtype: 'balloontip',    showDuration: -1,    show: function () {        if (!this.closest('body')) {
            this.appendTo();
        }        return Dom.prototype.show.apply(this, arguments);    },    showAt: function (x, y) {        return this.show(this.showDuration).setPosition(x, y);    },    showBy: function (ctrl, offsetX, offsetY) {	    var configs = ({	        left: ['rr-yc', 15, 0],	        right: ['ll-yc', 15, 0],	        top: ['xc-bb', 0, 15],	        bottom: ['xc-tt', 0, 15],	        'null': ['xc-tt', 0, 10]	    }[this.getArrow()]);	    return this.show(this.showDuration).align(ctrl, configs[0], offsetX === undefined ? configs[1] : offsetX, offsetY === undefined ? configs[2] : offsetY);	},	setArrow: function (value) {
	    var arrow = this.find('.x-arrow') || this.append('<span>\					<span class="x-arrow-fore">◆</span>\
                    <span class="x-arrow-back">◆</span>\				</span>');
	    if (value) {
	        arrow.node.className = 'x-arrow x-arrow-' + value;
	    } else {
	        arrow.remove();	    }	    return this;
	},		getArrow: function(){		var arrow = this.find('.x-arrow'), r = null;				if (arrow) {		    r = (/\bx-arrow-(top|bottom|left|right)/.exec(arrow.node.className) || [0, r])[1];		}		return r;	}});