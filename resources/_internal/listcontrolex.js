/** * @author  */		/**	 * 获取指定索引的项的选择状态。	 */	getSelected: function (index) {		if(index = this.controls[index]) {			return this.baseGetSelected(index);		}		return false;	},		/**	 * 设置指定索引的项的选择状态。但不会清空已有项。	 */	setSelected: function (index, value) {		if(index = this.controls[index]) {			var old = this.baseGetSelected(index);			this.baseSetSelected(index, value);			this.onSelectionChanged();			if(old !== value)				this.onChange();		}				return this;	},