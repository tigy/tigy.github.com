/**
 * @author xuld
 */

/**
 * 表示一个可选择控件接口。
 */
var ISelectable = {
	
    /**
     * 正在选中一个项时执行。
     * @param {Object} item 即将选中的项。
     * @return {Boolean} 如果返回 false，则阻止本次选择操作。
     * @protected virtual
     */
    onSelecting: function (item) {
        return this.trigger('selecting', item);
    },
    
    /**
     * 项已经被选择后执行。
     * @param {Object} item 已经选中的项。
     * @protected virtual
     */
    onSelect: function() {
    	return true;
    },

    /**
     * 当值被改变时执行。
     * @protected virtual
     */
    onChange: function () {
        this.trigger('change');
    }
    
};