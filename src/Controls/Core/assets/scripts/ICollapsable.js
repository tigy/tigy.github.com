/**
 * @author  xuld
 */


using("System.Fx.Animate");


/**
 * 表示一个可折叠的控件接口。
 * @interface ICollapsable
 * @remark ICollapsable 会对 #body() 节点（如果存在）进行折叠和展开效果。
 */
var ICollapsable = {

    /**
	 * 折叠效果的默认使用时间。如果为 0 表示无效果。
	 * @type {Integer} 
	 * @virtual
	 */
    collapseDuration: -1,

    /**
	 * 当控件已经被折叠时执行。
	 * @protected virtual
	 */
    onCollapsing: Function.empty,

    /**
	 * 当控件已经被折叠时执行。
	 * @protected virtual
	 */
    onCollapse: Function.empty,

    /**
	 * 当控件已经被折叠时执行。
	 * @protected virtual
	 */
    onExpanding: Function.empty,

    /**
	 * 当控件即将被展开时执行。
	 * @protected virtual
	 */
    onExpand: Function.empty,

    /**
	 * 当控件即将被展开时执行。
	 * @protected virtual
	 */
    onExpand: Function.empty,

    /**
	 * 获取目前是否折叠。
	 * @return {Boolean} 获取一个值，该值指示当前面板是否折叠。
	 * @virtual
	 */
    isCollapsed: function () {
        var body = this.body ? this.body() : this;
        return !body || Dom.isHidden(body.node);
    },

    /**
	 * 切换面板的折叠。
	 * @param {Integer} duration=#collapseDuration 折叠效果使用的时间。如果为 0 表示无效果。
     * @return this
	 */
    toggleCollapse: function (duration) {
        return this[this.isCollapsed() ? 'expand' : 'collapse'](duration);
    },

    /**
	 * 折叠面板。
	 * @param {Integer} duration=#collapseDuration 折叠效果使用的时间。如果为 0 表示无效果。
     * @return this
	 */
    collapse: function (duration) {
        var me = this,
			body,
			callback;

        // 如果允许折叠，则继续执行。
        if (me.trigger('collapsing') && (body = me.body ? me.body() : me)) {

            me.onCollapsing();

            // 折叠完成的回调函数。
            callback = function () {
                me.addClass('x-' + me.xtype + '-collapsed');
                me.onCollapse();
                me.trigger('collapse');
            };

            // 如果不加参数，使用同步方式执行。
            if (duration === 0) {
                body.hide();
                callback();
            } else {
                body.hide('height', duration || me.collapseDuration, callback, 'ignore');
            }
        }
        return me;
    },

    /**
	 * 展开面板。
	 * @param {Integer} duration=#collapseDuration 折叠效果使用的时间。如果为 0 表示无效果。
     * @return this
	 */
    expand: function (duration) {

        var me = this,
            body;

        // 如果允许展开，则继续执行。
        // 获取主体内容。
        // 仅当存在主体内容时才执行操作。
        if (me.trigger('expanding') && (body = me.body ? me.body() : me)) {

            me.onExpanding();

            me.removeClass('x-' + me.xtype + '-collapsed');

            if (duration === 0) {
                body.show();
                me.onExpand();
                me.trigger('expand');
            } else {
                body.show('height', duration || me.collapseDuration, function () {
                    me.trigger('expand');
                }, 'ignore');
            }
        }

        return me;
    }

};
