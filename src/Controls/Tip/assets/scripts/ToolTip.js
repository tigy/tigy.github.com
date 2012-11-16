/**
 * @author xuld
 */


imports("Controls.Part.Arrow");
imports("Controls.Tip.ToolTip");
using("Controls.Core.ContentControl");
using("Controls.Core.IToolTip");


	
///**
// * 当指针在具有指定工具提示文本的控件内保持静止时，工具提示保持可见的时间期限。-1表示不自动隐藏。 0 表示始终不显示。
// * @type Number
// */
//autoDelay: -1,
	
//	/**
//	 * 指针从一个控件移到另一控件时，必须经过多长时间才会出现后面的工具提示窗口。
//	 * @type Number
//	 */
//reshowDelay: 100,
/**
 * 表示一个工具提示。
 * @extends ContentControl
 */
var ToolTip = ContentControl.extend(IToolTip).implement({

    /**
     * 工具提示显示之前经过的时间。
     * @type Integer
     */
    initialDelay: 500,

    /**
     * 指针从一个控件移到另一控件时，必须经过多长时间才会出现后面的工具提示窗口。
     * @type Integer
     */
    reshowDelay: 100,
	
	xtype: 'tooltip',
	
	tpl: '<div class="x-control">\
			<span class="x-arrow x-arrow-bottom">\
				<span class="x-arrow-fore">◆</span>\
			</span>\
			<div class="x-control-content"></div>\
		</div>',

	content: function () {
	    return this.find('.x-tooltip-content');
	},
	
    /**
     * 设置某个控件工具提示。
     */
	setToolTip: function (ctrl, caption, offsetX, offsetY) {
	    ctrl = Dom.get(ctrl);

	    var me = this;
	    ctrl.on('mouseover', function () {
	        var waitTimeout = me.isHidden() ? me.initialDelay : me.reshowDelay;
	        if (me.showTimer)
	            clearTimeout(me.showTimer);

	        me.showTimer = setTimeout(function () {
	            me.showTimer = 0;

	            if (caption)
	                me.setText(caption);

	            me.showBy(ctrl, offsetX, offsetY);
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

});

/**
 * 显示一个提示。
 * @param {Element} elem 用来对齐的元素。
 * @param {String} text 显示的文本。
 * @param {Number} offsetY=2 Y 的偏移，负值向上。 
 * @param {Number} offsetX=0 X 的偏移，负值向左。 
 */
ToolTip.show = function(ctrl, text, offsetY, offsetX){
	return new ToolTip().setText(text).showBy(Dom.get(ctrl), offsetY === undefined ? 2 : offsetY, offsetX);
};




//function(x, y){
		
//    if(this.autoDelay > 0) {
//        me.timer = setTimeout(this.hide.bind(this), this.autoDelay);
//    }
		
//},
//	,
	
//close: function(){
//    var me = this;
//    if(me.timer) {
//        clearTimeout(me.timer);
//        me.timer = 0;
//    }
//    me.hide(me.duration, this.onHide, 'opacity');
//    return this;
//}




