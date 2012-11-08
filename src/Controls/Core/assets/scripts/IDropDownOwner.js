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
	 * @type {Control}
	 */
	dropDown: null,
	
	/**
	 * 下拉菜单的宽度。
	 * @config {String}
	 * @defaultValue 'auto'
	 * @return 如果值为 -1, 则和父容器有同样的宽度。如果设为 'auto'， 表示不处理宽度。
	 */
	dropDownWidth: 'auto',

    /**
	 * 下拉菜单的最小宽度。
	 * @config {dropDownMinWidth}
	 * @defaultValue 'auto'
	 * @return 如果值为 -1, 则和父容器有同样的宽度。如果设为 0， 表示无。
	 */
    dropDownMinWidth: 100,
	
	onDropDownShow: function(){
		this.trigger('dropdownshow');
	},
	
	onDropDownHide: function(){
		this.trigger('dropdownhide');
	},

	createDropDown: function (existDom) {
	    return existDom;
	},
	
	/**
	 * 获取当前控件的下拉菜单。
	 * @return {Control} 
	 */
	getDropDown: function () {
	    var dropDown = this.dropDown;

	    if (!dropDown) {
	        dropDown = this.next();
	        if (dropDown && !dropDown.hasClass('x-dropdown')) {
	            dropDown = null;
	        }

	        this.dropDown = this.createDropDown(dropDown);
	    }
	    
	    return this.dropDown;
	},
	
	attach: function(parentNode, refNode){
		if(this.dropDown && !this.dropDown.parent('body')) {
			this.dropDown.attach(parentNode, refNode);
		}
		Dom.prototype.attach.call(this, parentNode, refNode);
	},
	
	detach: function(parentNode){
		Dom.prototype.detach.call(this, parentNode);
		if(this.dropDown) {
			this.dropDown.detach(parentNode);
		}
	},

	setDropDown: function (dom) {

	    if (dom) {

	        // 修正下拉菜单为 Control 对象。
	        dom = dom instanceof Dom ? dom : Dom.get(dom);

	        // 设置下拉菜单。
	        this.dropDown = dom.addClass('x-dropdown').hide();

	        // 如果当前节点已经添加到 DOM 树，则同时添加 dom 。
	        if (!dom.parent('body')) {

                // 添加菜单到 DOM 树。
	            this.after(dom);

	            // IE6/7 无法自动在父节点无 z-index 时处理 z-index 。
	            if (navigator.isQuirks && dom.parent() && dom.parent().getStyle('zIndex') === 0)
	                dom.parent().setStyle('zIndex', 1);
	        }
	    } else if (this.dropDown) {
	        this.dropDown.remove();
	        this.dropDown = null;
	    }
		
		return this;
	},
	
	dropDownHidden: function () {
	    return this.dropDown && Dom.isHidden(this.dropDown.node);
	},
	
	realignDropDown: function (offsetX, offsetY) {
		this.dropDown.align(this, 'bl', offsetX, offsetY);
		return this;
	},
	
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
	
	showDropDown: function(){

	    var dropDown = this.dropDown;

	    if (this.dropDownHidden()) {
	        dropDown.show();
	        this.realignDropDown(0, -1);

	        var width = this.dropDownWidth;
	        if (width < 0) {
	            width = this.getSize().x;

	            var minWidth = Dom.styleNumber(dropDown.node, 'min-width') || this.dropDownMinWidth;

	            // 不覆盖 min-width
	            if (width < minWidth)
	                width = minWidth;
	        }

	        if (width !== 'auto') {
	            dropDown.setSize(width);
	        }

	        this.onDropDownShow();

	        document.on('mouseup', this.hideDropDown, this);
	    } else {
	        this.realignDropDown(0, -1);
	    }
		
		return this;
	},
	
	hideDropDown: function (e) {
		
		var dropDown = this.dropDown;
		
		if(dropDown && !this.dropDownHidden()){
			
			// 如果是来自事件的关闭，则检测是否需要关闭菜单。
			if(e){
				e = e.target;
				if([this._dropDownTrigger, dropDown.node, this.node].indexOf(e) >= 0 || Dom.has(dropDown.node, e) || Dom.has(this.node, e)) 
					return this;
			}
			
			this.onDropDownHide();
			dropDown.hide();
			document.un('mouseup', this.hideDropDown);
			
		}
		
		return this;
	}
	
};
