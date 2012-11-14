/**
 * @author  xuld
 */


imports("Controls.Button.MenuButton");
using("Controls.Core.IDropDownOwner");
using("Controls.Button.Button");
using("Controls.Core.ListControl");



var MenuButton = Button.extend(IDropDownOwner).implement({
	
	xtype: 'menubutton',
	
	tpl: '<button class="x-button x-control" type="button"><span class="x-menubutton-arrow"></span></button>',
	
	createDropDown: function () {
	    var existDom = this.next('.x-dropdown');
		if(existDom && !existDom.hasClass('x-menu')){
			return existDom;
		}
		assert(window.Menu, "必须载入 Controls.Menu.Menu 组件才能初始化 x-menu 的菜单项。");
		return new Menu(existDom).on('click', this.onDropDownClick, this);
	},

	state: function (name, value) {
	    return this.toggleClass('x-button-' + name, value);
	},
	
	init: function () {
		this.setDropDown(this.createDropDown());
		this.on('click', this.toggleDropDown, this);
	},
	
	onDropDownShow: function(){
		this.state('actived', true);
		return IDropDownOwner.onDropDownShow.apply(this, arguments);
	},
	
	onDropDownHide: function(){
	    this.state('actived', false);
		return IDropDownOwner.onDropDownHide.apply(this, arguments);
	},
	
	onDropDownClick: function(){
		this.hideDropDown();
	}
	
});

ListControl.aliasMethods(MenuButton, 'dropDown');
