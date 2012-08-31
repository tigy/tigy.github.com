/**
 * @author xuld 
 */



using("System.Dom.Base");


/**
 * 为控件提供按控件定位的方法。
 * @interface
 */
Dom.implement((function(){
	
	var aligners = {
			
			xc: function (opt) {
				opt.x = opt.tp.x + (opt.ts.x - opt.s.x) / 2 + opt.ox;
			},
			
			ol: function(opt, r){
				opt.x = opt.tp.x - opt.s.x - opt.ox;
				
				if(r > 0 && opt.x <= opt.dp.x) {
					aligners.or(opt, --r);
				}
			},
			
			or: function(opt, r){
				opt.x = opt.tp.x + opt.ts.x + opt.ox;
				
				if(r > 0 && opt.x + opt.s.x >= opt.dp.x + opt.ds.x) {
					aligners.ol(opt, --r);
				}
			},
			
			il: function (opt, r) {
				opt.x = opt.tp.x + opt.ox;
				
				if(r > 0 && opt.x + opt.s.x >= opt.dp.x + opt.ds.x) {
					aligners.ir(opt, --r);
				}
			},
			
			ir: function (opt, r) {
				opt.x = opt.tp.x + opt.ts.x - opt.s.x - opt.ox;
				
				if(r > 0 && opt.x <= opt.dp.x) {
					aligners.il(opt, --r);
				}
			},
			
			yc: function (opt) {
				opt.y = opt.tp.y + (opt.ts.y - opt.s.y) / 2 + opt.oy;
			},
			
			ot: function(opt, r){
				opt.y = opt.tp.y - opt.s.y - opt.oy;
				
				if(r > 0 && opt.y <= opt.dp.y) {
					aligners.ob(opt, --r);
				}
			},
			
			ob: function(opt, r){
				opt.y = opt.tp.y + opt.ts.y + opt.oy;
				
				if(r > 0 && opt.y + opt.s.y >= opt.dp.y + opt.ds.y) {
					aligners.ot(opt, --r);
				}
			},
			
			it: function (opt, r) {
				opt.y = opt.tp.y + opt.oy;
				
				if(r > 0 && opt.y + opt.s.y >= opt.dp.y + opt.ds.y) {
					aligners.ib(opt, --r);
				}
			},
			
			ib: function (opt, r) {
				opt.y = opt.tp.y + opt.ts.y - opt.s.y - opt.oy;
				
				if(r > 0 && opt.y <= opt.dp.y) {
					aligners.it(opt, --r);
				}
			}
			
		},
		
		setter = Object.map({
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
			
			'~lb': 'il ib',
			'~rt': 'ir it',
			'~rb': 'ir ib',
			'~lt': 'il it',
			'~rc': 'ir yc',
			'~bc': 'xc ib',
			'~tc': 'xc it',
			'~lc': 'il yc',
			
			'^lb': 'ol ob',
			'^rt': 'or ot',
			'^rb': 'or ob',
			'^lt': 'ol ot'
			
		}, function(value){
			value = value.split(' ');
			value[0] = aligners[value[0]];
			value[1] = aligners[value[1]];
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
		 * @param {Boolean} enableReset 如果元素超出屏幕范围，是否自动更新节点位置。
		 * @memberOf Control
		 */
		align: function(ctrl, position, offsetX, offsetY, enableReset) {
					
			assert(!position || position in setter, "Control.prototype.align(ctrl, position,  offsetX, offsetY): {position} 必须是 l r c 和 t b c 的组合。如 lt", position);
			
			ctrl = ctrl instanceof Dom ? ctrl : Dom.get(ctrl);
			position = setter[position] || setter.lb;
			
			var opt = {
				s: this.getSize(),
				ts: ctrl.getSize(),
				tp: ctrl.getPosition(),
				ds: document.getSize(),
				dp: document.getPosition(),
				ox: offsetX,
				oy: offsetY
			}, r = enableReset === false ? 0 : 2;
			
			position[0](opt, r);
			position[1](opt, r);
			
			return this.setPosition(opt);
		}
		
	};
	
})());

