/**
 * @author
 */


imports("Controls.Button.Menu");
using("System.Dom.Align");
using("Controls.Core.ContentControl");
using("Controls.Core.ListControl");


var MenuItem = ContentControl.extend({

	xtype: 'menuitem',

	tpl: '<a class="x-menuitem"></a>',

	/**
	 * 获取当前菜单管理的子菜单。
	 */
	subMenu: null,

	/**
	 *
	 */
	init: function() {
		this.base('init');
		this.unselectable();
		this.on('mouseover', this.onMouseEnter);
		this.on('mouseout', this.onMouseLeave);
	},

	attach: function(parentNode, refNode) {
		parentNode.insertBefore(this.node, refNode);
		if (this.subMenu && !this.subMenu.parent('body')) {
			this.after(this.subMenu);
		}
	},

	detach: function(parentNode) {
		parentNode.removeChild(this.node);
		if (this.subMenu) {
			this.subMenu.remove();
		}
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

			if (!menu.parent('body')) {
				this.after(menu);
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
			var dt = new Dom(tg).dataField().menu;
			tg.hideSubMenu();
		}

	},

	onMouseEnter: function() {

		// 使用父菜单打开本菜单，显示子菜单。
		this.parentControl && this.parentControl.showSubMenu(this);

	},

	onMouseLeave: function(e) {

		// 没子菜单，需要自取消激活。
		// 否则，由父菜单取消当前菜单的状态。
		// 因为如果有子菜单，必须在子菜单关闭后才能关闭激活。

		if (!this.subMenu)
			this.setSelected(false);

	}

});

Object.map("Selected Checked Disabled", function(key) {
	var p = MenuItem.prototype, c = 'x-menuitem-' + key.toLowerCase();
	p['set' + key] = function(value) {
		return this.toggleClass(c, value);
	};

	p['get' + key] = function() {
		return this.hasClass(c);
	};
});

var MenuSeperator = MenuItem.extend({

	tpl: '<div class="x-menuseperator"></div>',

	init: Function.empty,

	setSubMenu: Function.empty

});

var Menu = ListControl.extend({

	xtype: 'menu',

	item: function(index) {
		var item = this.child(index);

		return item && item.dataField().control || item;
	},

	_createMenuItem: function(childControl, item) {

		// 如果是文本。
		if (childControl.node.nodeType === 3) {

			// - => MenuSeperator
			if (/^\s*-\s*$/.test(childControl.getText())) {

				// 删除文本节点。
				if (item) {
					item.remove(childControl);
				}

				childControl = new MenuSeperator;

				// 其它 => 添加到 MenuItem
			} else {

				// 保存原有 childControl 。
				var t = childControl;
				childControl = new MenuItem;
				childControl.append(t);
			}
			if (item) {
				item.prepend(childControl);
			}
		} else {

			// 创建对应的 MenuItem 。
			childControl = new MenuItem(childControl);
		}

		return childControl;

	},

	/**
	 * 分析一个 <li> 标签，并返回对应的 MenuItem 。
	 */
	_initChild: function(item) {

		// 找到第一个节点。
		var childControl = item.first();

		// 如果没找到节点或者找到的节点是 x-menu, 重新查找文本节点。
		if (!childControl || childControl.hasClass('x-menu')) {

			// 包含文本节点继续查找。
			childControl = item.first(true);

			// 如果仍然只找到 x-menu 或节点不存在，则说明没有符合要求的节点，创建一个空节点占据位置。
			if (!childControl || childControl.hasClass('x-menu')) {
				childControl = new MenuItem;
			}
		}

		// 创建菜单。
		childControl = this._createMenuItem(childControl, item);

		// 获取子菜单。
		var subMenu = item.find('>.x-menu');

		// 如果存在子菜单，设置子菜单。
		if (subMenu) {
			childControl.setSubMenu(subMenu);
		}

	},

	onAdding: function(childControl) {

		// 如果是添加 <li> 标签，则直接返回。
		// .add('<li></li>')
		if (childControl.node.tagName === 'LI') {
			this._initChild(childControl);

			// .add(new MenuItem())
		} else if (!(childControl instanceof MenuItem)) {

			// .add(文本或节点)
			childControl = this._createMenuItem(childControl);

		}

		return childControl;
	},

	init: function() {

		// 绑定节点和控件，方便发生事件后，根据事件源得到控件。
		this.dataField().control = this;

		// 根据已有的 DOM 结构初始化菜单。
		this.each(this.onAdding, this);
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
		menuItem.setSelected(true);

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
			this.currentSubMenu.subMenu.hide();

			// 取消激活菜单。
			this.currentSubMenu.setSelected(false);
			this.currentSubMenu = null;
		}
	}

});



