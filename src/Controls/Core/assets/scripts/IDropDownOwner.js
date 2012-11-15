/**
 * @author xuld
 */


imports("Controls.Core.IDropDownOwner");
using("System.Dom.Align");

/**
 * 所有支持下拉菜单的组件实现的接口。
 * @interface IDropDownOwner
 */
var IDropDownOwner = {
	
	/**
	 * 获取或设置当前实际的下拉菜单。
	 * @protected
	 * @type {Dom}
	 */
	dropDown: null,
	
	/**
	 * 下拉菜单的宽度。
	 * @config {String}
	 * @defaultValue 'auto'
	 * @return 如果值为 -1, 则和下拉菜单目标节点有同样的宽度。如果值为 'auto'， 表示根据内容自动决定。
	 */
	dropDownWidth: -1,

    /**
	 * 下拉菜单的最小宽度。
	 * @config {Integer}
	 * @defaultValue 100
	 * @return 如果值为 Infinity, 则表示不限制最小宽度。
	 * @remark 也可以通过 css 的 min-width 属性设置此值。
	 */
    dropDownMinWidth: 100,

    /**
	 * 当下拉菜单被展开时执行。
     * @protected virtail
	 */
	onDropDownShow: function(){
	    this.trigger('dropdownshow');
	},

    /**
	 * 当下拉菜单被折叠时执行。
     * @protected virtail
	 */
	onDropDownHide: function(){
		this.trigger('dropdownhide');
	},

	attach: function (parentNode, refNode) {
	    if (this.dropDown && !this.dropDown.closest('body')) {
	        this.dropDown.attach(parentNode, refNode);
	    }
	    Dom.prototype.attach.call(this, parentNode, refNode);
	},

	detach: function (parentNode) {
	    Dom.prototype.detach.call(this, parentNode);
	    if (this.dropDown) {
	        this.dropDown.detach(parentNode);
	    }
	},
	
	/**
	 * 获取当前控件的下拉菜单。
	 * @return {Dom} 
     * @protected virtual
	 */
	getDropDown: function () {
	    return this.dropDown;
	},

    /**
	 * 设置当前控件的下拉菜单。
     * @param {Dom} dom 要设置的下拉菜单节点。
	 * @return {Dom} 
     * @protected virtual
	 */
	setDropDown: function (dom) {

	    if (dom) {

	        // 修正下拉菜单为 Dom 对象。
	        dom = dom instanceof Dom ? dom : Dom.get(dom);

	        // 初始化并保存下拉菜单。
	        this.dropDown = dom.addClass('x-dropdown').hide();

	        // 如果下拉菜单未添加到 DOM 树，则添加到当前节点后。
	        if (!dom.closest('body')) {

                // 添加下拉菜单到 DOM 树。
	            this.after(dom);

	            // IE6/7 无法自动在父节点无 z-index 时处理 z-index 。
	            if (navigator.isQuirks && dom.parent() && dom.parent().getStyle('zIndex') === 0)
	                dom.parent().setStyle('zIndex', 1);
	        }

        // dom = null 表示清空下拉菜单。
	    } else if (this.dropDown) {
	        this.dropDown.remove();
	        this.dropDown = null;
	    }
		
		return this;
	},

    /**
     * 判断当前下拉菜单是否被隐藏。
     * @return this
     * @protected virtual
     */
	dropDownHidden: function () {
	    return this.dropDown && Dom.isHidden(this.dropDown.node);
	},

    /**
     * 切换下拉菜单的显示状态。
     * @return this
     */
	toggleDropDown: function (e) {

	    // 如果是因为 DOM 事件而切换菜单，则测试是否为 disabled 状态。
	    if (e) {
	        if (this.getAttr('disabled') || this.getAttr('readonly')) {
	            return this;
	        }
	        this._dropDownTrigger = e.target;
	    }
	    return this[this.dropDownHidden() ? 'showDropDown' : 'hideDropDown']();
	},
	
    /**
     * 展开下拉菜单。
     * @return this
     */
	showDropDown: function(){

        // 如果下拉菜单被隐藏，则先重设大小、定位。
	    if (this.dropDownHidden()) {

	        // 重新设置位置。
	        var dropDown = this.dropDown.show().align(this, 'bl', 0, -1);

	        // 重新修改宽度。

	        var width = this.dropDownWidth;
	        if (width < 0) {

	            // 不覆盖 min-width
	            width = Math.max(this.getSize().x, Dom.styleNumber(dropDown.node, 'min-width'), this.dropDownMinWidth, dropDown.getScrollSize().x);

	        }

	        if (width !== 'auto') {
	            dropDown.setSize(width);
	        }

	        // 设置 mouseup 后自动隐藏菜单。
	        document.on('mouseup', this.hideDropDown, this);

	        this.onDropDownShow();

	    }
		
		return this;
	},

    /**
     * 关闭下拉菜单。
     * @return this
     */
	hideDropDown: function (e) {
		
		var dropDown = this.dropDown;
		
        // 仅在本来已显示的时候操作。
		if(dropDown && !this.dropDownHidden()){
			
			// 如果是来自事件的关闭，则检测是否需要关闭菜单。
			if(e){
			    e = e.target;

                // 如果事件源是来自下拉菜单自身，则不操作。
				if([this._dropDownTrigger, dropDown.node, this.node].indexOf(e) >= 0 || Dom.has(dropDown.node, e) || Dom.has(this.node, e)) 
					return this;
			}
			
			dropDown.hide();

            // 删除 mouseup 回调。
			document.un('mouseup', this.hideDropDown);

			this.onDropDownHide();
			
		}
		
		return this;
	}
	
};
