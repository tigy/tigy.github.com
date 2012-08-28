/**
 * @author xuld
 */


imports("Controls.Button.Menu");
using("System.Dom.Align");
using("Controls.Core.ContentControl");
using("Controls.Core.ListControl");



/**
 * 表示菜单项。 
 */
var MenuItem = ContentControl.extend({

	xtype: 'menuitem',

	tpl: '<a class="x-control"></a>',

	/**
	 * 获取当前菜单管理的子菜单。
	 */
	subMenu: null,

	/**
	 *
	 */
	init: function() {
		this.unselectable();
		this.on('mouseover', this.onMouseEnter);
		this.on('mouseout', this.onMouseLeave);
	},

	attach: function(parentNode, refNode) {
		if (this.subMenu && !this.subMenu.parent('body')) {
			parentNode.insertBefore(this.subMenu.node, refNode);
		}
		parentNode.insertBefore(this.node, refNode);
	},

	detach: function(parentNode) {
		if (this.subMenu) {
			this.subMenu.remove();
		}
		
		if(this.node.parentNode === parentNode) {
			parentNode.removeChild(this.node);
		}
	},

	onMouseEnter: function() {
		this.hovering(true);
		this.showSubMenu();
	},
	
	onMouseLeave: function(e) {

		// 没子菜单，需要自取消激活。
		// 否则，由父菜单取消当前菜单的状态。
		// 因为如果有子菜单，必须在子菜单关闭后才能关闭激活。

		if (!this.subMenu)
			this.hovering(false);

	},
	
	getSubMenu: function(){
		if(!this.subMenu){
			this.setSubMenu(new Menu());
		}
		return this.subMenu;
	},

	setSubMenu: function(menu) {
		if (menu) {
			if (!(menu instanceof Menu)) {
				menu = new Menu(menu);
			}

			if (!menu.parent('body') && this.node.parentNode) {
				this.node.parentNode.insertBefore(menu.node, this.node.nextSibling);
			}

			this.subMenu = menu.hide();
			menu.floating = false;
			this.addClass('x-menuitem-submenu');
			this.on('mouseup', this._cancelHideMenu);
		} else {
			menu.floating = true;
			this.removeClass('x-menuitem-submenu');
			this.un('mouseup', this._cancelHideMenu);
		}
		return this;
	},

	_cancelHideMenu: function(e) {
		e.stopPropagation();
	},

	toggleIcon: function(icon, val) {
		this.icon.toggleClass(icon, val);
		return this;
	},

	_hideTargetMenu: function(e) {
		var tg = e.relatedTarget;
		while (tg && !Dom.hasClass(tg, 'x-menu')) {
			tg = tg.parentNode;
		}

		if (tg) {
			new Dom(tg).dataField().control.hideSubMenu();
		}

	},

	showSubMenu: function(){

		// 使用父菜单打开本菜单，显示子菜单。
		this.parentControl && this.parentControl.showSubMenu(this);
		
		return this;
	},
	
	hideSubMenu: function(){

		// 使用父菜单打开本菜单，显示子菜单。
		this.parentControl && this.parentControl.hideSubMenu(this);
		
		return this;
	},
	
	setAttr: function(name, value) {
		if(/^(selected|checked|disabled)$/i.test(name)){
			return this[name.toLowerCase()](value);
		}
		return Dom.prototype.setAttr.call(this, name, value);
	},
	
	removeChild: function(childControl){
		childControl.detach(this.node);
		
		if(this.subMenu)
			childControl.detach(this.subMenu.node);
	},

	/**
	 * 切换显示鼠标是否移到当前项。
	 */
	hovering: function(value){
		return this.toggleClass('x-' + this.xtype + '-hover', value);
	}

}).defineMethods('getSubMenu()', 'item indexOf each count add addAt removeAt');;

Object.map("selected checked disabled", function(funcName) {
	MenuItem.prototype[funcName] = function(value) {
		this.toggleClass('x-' + this.xtype + '-' + funcName, value);
		return Dom.prototype.setAttr.call(this, funcName, value);
	};
});

var MenuSeperator = MenuItem.extend({

	tpl: '<div class="x-menuseperator"></div>',

	init: Function.empty,

	setSubMenu: Function.empty

});

var Menu = ListControl.extend({

	xtype: 'menu',

	_createMenuItem: function(childControl, parent) {

		// 如果是文本。
		if (childControl.node.nodeType === 3) {

			// - => MenuSeperator
			if (/^\s*-\s*$/.test(childControl.getText())) {

				// 删除文本节点。
				if (parent) {
					parent.remove(childControl);
				}

				childControl = new MenuSeperator;

				// 其它 => 添加到 MenuItem
			} else {

				// 保存原有 childControl 。
				var t = childControl;
				childControl = new MenuItem;
				childControl.append(t);
			}
			if (parent) {
				parent.prepend(childControl);
			}
		} else if(childControl.hasClass('x-menuseperator')){
			childControl = new MenuSeperator;
		} else {

			// 创建对应的 MenuItem 。
			childControl = new MenuItem(childControl);
		}

		return childControl;

	},

	/**
	 * 处理一个子控件，返回相应的 MenuItem 对象。
	 */
	_initLiChild: function(li){
	
		// 获取第一个子节点。
		var subMenu = li.find('>.x-' + this.xtype),
			item = (subMenu ? (subMenu.prev() || subMenu.prev(true)) : (li.first() || li.first(true))) || Dom.parse('');
			
		// 根据节点创建一个 MenuItem 对象。
		item = this._createMenuItem(item, li);

		// 如果存在子菜单，设置子菜单。
		if (subMenu) {
			item.setSubMenu(subMenu);
		}
			
		// 保存 li -> childControl 的关联。
		li.dataField().namedItem = item;
		
		return item;

	},

	/**
	 * 处理一个子控件。
	 */
	initChild: function(childControl){
		
		var item;
		
		// 如果是添加 <li> 标签，则直接返回。
		// .add('<li></li>')
		if (childControl.node.tagName === 'LI') {
			
			this._initLiChild(childControl);
	
		// .add(new MenuItem())
		} else {
			
			// 转为 MenuItem 对象。
			// .add(文本或节点)
			item = childControl instanceof MenuItem ? childControl : this._createMenuItem(childControl);
			
			// 创建一个新的容器节点。
			childControl = Dom.create('LI', 'x-' + this.xtype + '-item');
			
			// 复制节点。
			childControl.append(item);
				
			// 保存 li -> childControl 的关联。
			childControl.dataField().namedItem = item;
		}

		return childControl;
	},
	
	initItems: function(){
		for(var c = this.first(); c; c = c.next()){
			this._initLiChild(c).parentControl = this;
		}
	},
	
	init: function() {
		
		this.addClass('x-' + this.xtype);

		// 绑定节点和控件，方便发生事件后，根据事件源得到控件。
		this.dataField().control = this;

		// 根据已有的 DOM 结构初始化菜单。
		this.initItems();
	},

	showMenu: function() {
		this.show();
		this.onShow();
	},

	hideMenu: function() {
		this.hide();
		this.onHide();
	},
	
	/**
	 * 当前菜单依靠某个控件显示。
	 * @param {Control} ctrl 方向。
	 */
	showAt: function(x, y) {

		if (!this.parent('body')) {
			this.appendTo();
		}

		// 显示节点。
		this.showMenu();

		this.setPosition(x, y);

		return this;
	},

	/**
	 * 当前菜单依靠某个控件显示。
	 * @param {Control} ctrl 方向。
	 */
	showBy: function(ctrl, pos, offsetX, offsetY, enableReset) {

		if (!this.parent('body')) {
			this.appendTo(ctrl.parent());
		}

		// 显示节点。
		this.showMenu();

		this.align(ctrl, pos || 'rt', offsetX != null ? offsetX : -5, offsetY != null ? offsetY : -5, enableReset);

		return this;
	},

	onShow: function() {
		this.floating = true;
		document.once('mouseup', this.hideMenu, this);
		this.trigger('show');
	},

	/**
	 * 关闭本菜单。
	 */
	onHide: function() {

		// 先关闭子菜单。
		this.hideSubMenu();
		this.trigger('hide');
	},

	/**
	 * 显示指定项的子菜单。
	 * @param {MenuItem} menuItem 子菜单项。
	 * @protected
	 */
	showSubMenu: function(menuItem) {

		// 如果不是右键的菜单，在打开子菜单后监听点击，并关闭此子菜单。
		if (!this.floating)
			document.once('mouseup', this.hideSubMenu, this);

		// 隐藏当前项子菜单。
		this.hideSubMenu();

		// 激活本项。
		menuItem.hovering(true);

		// 如果指定的项存在子菜单。
		if (menuItem.subMenu) {

			// 设置当前激活的项。
			this.currentSubMenu = menuItem;

			// 显示子菜单。
			menuItem.subMenu.showBy(menuItem);

		}
		
	},

	/**
	 * 关闭本菜单打开的子菜单。
	 * @protected
	 */
	hideSubMenu: function() {

		// 如果有子菜单，就隐藏。
		if (this.currentSubMenu) {

			// 关闭子菜单。
			this.currentSubMenu.subMenu.hideMenu();

			// 取消激活菜单。
			this.currentSubMenu.hovering(false);
			this.currentSubMenu = null;
		}
		
	}

});



