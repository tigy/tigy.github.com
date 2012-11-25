/**
 * @author xuld
 */


using("System.Dom.Base");


Dom.implement({
	
	popup: function(options){
		
		if(options.constructor !== Object){
			options = {target: Dom.get(options)};
		}
		
		var me = this, timer, atPopup, atTarget;
		
		options.delay = options.delay || 300;
		
		options.target
			.hide()
			.on('mouseenter', function(){
				atPopup = true;
			})
			.on('mouseleave', function(){
				atPopup = false;
			});
		
		me.on('mouseenter', function(e){
			
			atTarget = true;
			
			if(timer){
				clearTimeout(timer);
			}
			
			timer = setTimeout(function(){
				
				timer = 0;
				
				options.target.show();
				
				if(options.show){
					options.show.call(me);
				}
				
			}, options.delay);
			
		});
		
		me.on('mouseleave', function(e){
			
			atTarget = false;
			
			if(timer){
				clearTimeout(timer);
			}
			
			timer = setTimeout(function(){
				
				timer = 0;
				
				if(!atTarget){
					
					if(!atPopup){
						options.target.hide();
						
						if(options.hide){
							options.hide.call(me);
						}
						
					} else {
						setTimeout(arguments.callee, options.delay);
					}
					
				}
				
			}, options.delay);
			
		});
		
		return me;
		
	}

});