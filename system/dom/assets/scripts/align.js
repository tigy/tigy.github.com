/**
 * @author xuld 
 */



using("System.Dom.Element");


/**
 * 为控件提供按控件定位的方法。
 * @interface
 */
Control.implement((function(){
	
	var aligns = {
		
		ol: function (ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, enableReset) {
			var x = targetPosition.x - ctrlSize.x - offset;
			if(enableReset && x <= documentPosition.x) {
				x = aligns.or(ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, 1);
			}
			
			return x;
		},
		
		or: function (ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, enableReset) {
			var x = targetPosition.x + targetSize.x + offset;
			if(enableReset && x + ctrlSize.x >= documentPosition.x + documentSize.x) {
				if(ctrl.onOverflowX){
					ctrl.onOverflowX(documentSize.x);  
				}
				x = aligns[enableReset === 1 ? 'xc' : 'ol'](ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, true);
			}
			
			return x;
		},
		
		xc: function (ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl) {
			return targetPosition.x + (targetSize.x - ctrlSize.x) / 2 + offset;
		},
		
		il: function (ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, enableReset) {
			var x = targetPosition.x + offset;
			if(enableReset && x <= x + ctrlSize.x >= documentPosition.x + documentSize.x) {
				x = aligns.ir(ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, true);
			}
			
			return x;
		},
		
		ir: function (ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, enableReset) {
			var x = targetPosition.x + targetSize.x - ctrlSize.x - offset;
			if(enableReset && x <= documentPosition.x) {
				x = aligns.il(ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl);
			}
			
			return x;
		},
		
		ot: function (ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, enableReset) {
			var y = targetPosition.y - ctrlSize.y - offset;
			if(enableReset && y <= documentPosition.y) {
				y = aligns.ob(ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, 1);
			}
			
			return y;
		},
		
		ob: function (ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, enableReset) {
			var y = targetPosition.y + targetSize.y + offset;
			if(enableReset && y + ctrlSize.x >= documentPosition.y + documentSize.y) {
				if(ctrl.onOverflowY){
					ctrl.onOverflowY(documentSize.y);  
				}
				y = aligns[enableReset === 1 ? 'yc' : 'ot'](ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, true);
			}
			
			return y;
		},
		
		yc: function (ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl) {
			return targetPosition.y + (targetSize.y - ctrlSize.y) / 2 + offset;
		},
		
		it: function (ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, enableReset) {
			var y = targetPosition.y + offset;
			if(enableReset && y + ctrlSize.x >= documentPosition.y + documentSize.y) {
				y = aligns.ib(ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, true);
			}
			
			return y;
		},
		
		ib: function (ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl, enableReset) {
			var y = targetPosition.y + targetSize.y - ctrlSize.y - offset;
			if(enableReset && y <= documentPosition.y) {
				y = aligns.it(ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offset, ctrl);
			}
			
			return y;
		}
		
	},
	
	setter = Object.update({
		bl: 'il ob',
		bl: 'il ob',
		rt: 'or it',
		rb: 'or ib',
		lt: 'ol it',
		lb: 'ol ib',
		br: 'ir ob',
		tr: 'ir ot',
		tl: 'il ot',
		rc: 'or yc',
		bc: 'xc ob',
		tc: 'xc ot',
		lc: 'ol yc',
		cc: 'xc yc',
		
		'lb-': 'il ib',
		'rt-': 'ir it',
		'rb-': 'ir ib',
		'lt-': 'il it',
		'rc-': 'ir yc',
		'bc-': 'xc ib',
		'tc-': 'xc it',
		'lc-': 'il yc',
		
		'lb^': 'ol ob',
		'rt^': 'or ot',
		'rb^': 'or ob',
		'lt^': 'ol ot'
		
	}, function(value){
		value = value.split(' ');
		value[0] = aligns[value[0]];
		value[1] = aligns[value[1]];
		return value;
	}, {});
		
		/*
		 *      tl   tc   tr
		 *      ------------
		 *   lt |          | rt
		 *      |          |
		 *   lc |    cc    | rc
		 *      |          |
		 *   lb |          | rb
		 *      ------------
		 *      bl   bc   br
		 */
	
	return {
		
		/**
		 * 基于某个控件，设置当前控件的位置。改函数让控件显示都目标的右侧。
		 * @param {Controls} ctrl 目标的控件。
		 * @param {String} align 设置的位置。如 lt rt 。完整的说明见备注。
		 * @param {Number} offsetX 偏移的X大小。
		 * @param {Number} offsetY 偏移的y大小。
		 * @memberOf Control
		 */
		align: function (ctrl, position,  offsetX, offsetY, enableReset) {
			var ctrlSize = this.getSize(),
				targetSize = ctrl.getSize(),
				targetPosition = ctrl.getPosition(),
				documentSize = document.getSize(),
				documentPosition = document.getPosition();
					
			assert(!position || position in setter, "Control.prototype.align(ctrl, position,  offsetX, offsetY): {position} 必须是 l r c 和 t b c 的组合。如 lt", position);
				
			position = setter[position] || setter.lb;
			enableReset = enableReset !== false;
			
			this.setPosition(
				position[0](ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offsetX || 0, this, enableReset),
				position[1](ctrlSize, targetSize, targetPosition, documentSize, documentPosition, offsetY || 0, this, enableReset)
			);
		}
		
	};
	
})());

