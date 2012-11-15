/** * @author  */
	
///**
//* 当当前控件在屏幕中显示不下时，由 align 函数触发执行此函数。
//* @param {String} xOry 值为 "x" 或 "y"。
//* @param {Integer} value 设置的最大值。
//* @param {Boolean} isOverflowing 如果值为 true，表示发生了此事件，否则表示恢复此状态。
//*/
//onOverflow: function(xOry, value, isOverflowing){
//    var data = this['overflow' + xOry];
//    if(isOverflowing){
//        if(!data){
//    	    this['overflow' + xOry] = this[xOry === 'x' ? 'getWidth' : 'getHeight']();
//        }
//        this[xOry === 'x' ? 'setWidth' : 'setHeight'](value);
//    } else if(data !== undefined){
//        this[xOry === 'x' ? 'setWidth' : 'setHeight'](data);
//        delete this['overflow' + xOry];
//    }
//},	/**	 * 使用指定函数或 ID 获取指定的子控件。	 * @param {String/Function} fn 查找的控件的ID/查找过滤的函数。	 * @param {Boolean} child=true 是否深度查找。	 * @return {Control} 控件。	 */	findControl: function(fn, child){		if (typeof fn == 'string') {			var id = fn;			fn = function(ctrl) {				return (ctrl.node || ctrl).id === id;			};		}					for(var controls = this.controls, i = 0; i < controls.length; i++){			var ct = controls[i], r;			if(fn(ct))				return ct;						if (child !== false && ct.findControl) {				r = ct.findControl(fn, child);				if(r)					return r;			}		}						return null;			},