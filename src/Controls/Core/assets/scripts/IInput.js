/**
 * @author xuld
 */

/**
 * 所有表单输入控件实现的接口。
 * @interface IInput
 */
var IInput = {

    /**
	 * 获取或设置当前输入域的状态。
	 * @private
	 */
    updateState: function (name, value) {
        value = value !== false;
        this.toggleClass('x-' + this.xtype + '-' + name, value);
        return Dom.prototype.setAttr.call(this.input(), name, value);
    },

    /**
	 * 当设置文本时执行此函数。
	 */
    onChange: function () {
        this.trigger('change');
    },
	
	/**
	 * 获取或设置当前表单的实际域。
	 * @protected
	 * @type {Control}
	 */
	hiddenField: null,
	
	/**
	 * 创建用于在表单内保存当前输入值的隐藏域。
	 * @return {Dom} 隐藏输入域。
	 */
	createHiddenField: function(){
		return Dom.parse('<input type="hidden">').appendTo(this).setAttr('name', Dom.getAttr(this.node, 'name'));
	},
	
	/**
	 * 获取当前输入域实际用于提交数据的表单域。
	 * @return {Dom} 一个用于提交表单的数据域。
	 */
	input: function(){
		
		// 如果不存在隐藏域。
		if(!this.hiddenField) {
			
			// 如果 当前元素是表单元素，直接返回。
			if(/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(this.node.tagName)){
				return new Dom(this.node);
			}
			
			this.hiddenField = this.find("input,select,textarea") || this.createHiddenField();
		}
		
		return this.hiddenField;
	},
	
	/**
	 * 获取当前控件所在的表单。
	 * @return {Dom} 表单。
	 */
	form: function () {
		return Dom.get(this.input().node.form);
	},
	
	/**
	 * 选中当前控件。
	 * @return this
	 */
	select: function(){
		Dom.prototype.select.apply(this.input(), arguments);
		return this;
	},
	
	setAttr: function (name, value) {
		var dom = this;
		if(/^(disabled|readonly|checked|selected|actived)$/i.test(name)){
			return this.updateState(name.toLowerCase(), value);
		}
		
		if(/^(value|name|form)$/i.test(name)) {
			dom = this.input();
		}
		
		return Dom.prototype.setAttr.call(dom, name, value);
	},
	
	getAttr: function (name, type) {
		return Dom.getAttr((/^(disabled|readonly|checked|selected|actived|value|name|form)$/i.test(name) ? this.input() : this).node, name, type);
	},
	
	getText: function(){
		return Dom.getText(this.input().node);
	},
	
	setText: function(value){
		var old = this.getText();
		Dom.prototype.setText.call(this.input(), value);
		if(old !== value)
			this.onChange();
			
		return this;
	}
	
};