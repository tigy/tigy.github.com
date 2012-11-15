/**
 * @author 
 */




using("System.Dom.Validate");


Object.extend(Validator, {
	
	initTarget: (function(){
		
		var duration = 100;
		
		function getContainer(type, validator){
			type += 'Container';
			var id = validator.target.getAttr(type);
			id = id && Dom.get(id);
			if(id)
				return id;
			
			id = validator.target.getAttr('id');
			return id && Dom.get(id + '.' + type);
		}
		
		function initFunction(validator, attrName){
			var val = validator.target.getAttr('onvalidate' + attrName);
			
			if(val == undefined)
				return;
				
			val = new Function('event', val);
			
			validator.on(attrName, val, validator.target.node);
		}
		
		function initRegExp(validator, attrName){
			var val = validator.target.getAttr(attrName);
			if(val == undefined)
				return ;
				
			validator.target.setAttr(attrName, null);
			
			val = new RegExp(val);
		
			validator.set(attrName, val, validator.target.getAttr('msg-' + attrName));
		}
		
		function getAttrNumber(validator, attrName){
			var val = validator.target.getAttr(attrName);
			if(val == undefined)
				return -1;
			
			if(typeof val !== 'number') {
				val = +val;
				if(isNaN(val)) {
					return -1;
				}
			}
			
			return val;
		}
		
		function initNumber(validator, attrName){
			var val = getAttrNumber(validator, attrName);
			if(val >= 0) {
				validator.target.setAttr(attrName, null);
				validator.set(attrName, val, validator.target.getAttr('msg-' + attrName));
			}
		}
		
		function initBoolean(validator, attrName){
			var val = validator.target.getAttr(attrName);
			if(val == undefined)
				return ;
				
			validator.target.setAttr(attrName, null);
			
			if(typeof val !== 'boolean') {
				val = val && !/^false$/i.test(val);
			}
		
			validator.set(attrName, val, validator.target.getAttr('msg-' + attrName));
		}
	
		function initCounter(validator){
			var counter = getContainer('counter', validator),
				maxLength;
			if(counter){
				maxLength = getAttrNumber(validator, 'maxLength') || -1;
				validator.target.on('change', updateCounter).on('keyup', updateCounter);
				updateCounter();
			}
			
			function updateCounter(){
				var len = validator.target.getText().length;
				if(maxLength !== -1 && len > maxLength){
					counter.setHtml(String.format(Validator.messages.counterError, maxLength, maxLength - len, len, len - maxLength));	
				} else {
					counter.setHtml(String.format(Validator.messages.counterSuccess, maxLength, maxLength - len, len, len - maxLength));	
				}
			}
		}
		
		function initPlaceholder(validator){
			var placeholderContainer = getContainer('placeholder', validator);
			var placeholder = validator.target.getAttr('placeholder');
			
			if(!placeholderContainer) {
				if(!placeholder)
					return;
				
				// 生成自定义的 placeholderContainer 。
				var newId = 'placeholderContainer-' + JPlus.id++;
				validator.target.setAttr('placeholderContainer', newId);
				placeholderContainer = Dom.create('span', 'x-placeholder');
				placeholderContainer.setAttr('id', newId);
				
				// var tid = validator.target.getAttr('id');
				// if(!tid) {
					// tid = 'placeholder-' + JPlus.id++;
					// validator.target.setAttr('id', tid);
				// }
				// placeholderContainer.setAttr('for', tid);
				
				var p = validator.target.parent().node;
				
				Dom.movable(p);
				
				validator.target.after(placeholderContainer);
				placeholderContainer.setOffset(validator.target.getOffset().add(Dom.calc(validator.target.node, '{x:ml + pl + bl, y:mt}')));
			}
			
			if(placeholder){
				validator.target.setAttr('placeholder', null);
				placeholderContainer.setHtml(placeholder);
			}
			
			validator.showPlaceholder = showPlaceholderContainer;
			validator.hidePlaceholder = hidePlaceholderContainer;
			validator.resetPlaceholder = showPlaceholderContainer;
			
			validator.target.on('focus', hidePlaceholderContainer, validator).on('blur', showPlaceholderContainer, validator);
			
			placeholderContainer.on(navigator.isIE6 ? 'click' : 'mousedown', clickPlaceholderContainer, validator.target);
			
			validator.resetPlaceholder();
		}
		
		function clickPlaceholderContainer (e){
			try{
			    this.focus();
			}catch(e) {
				
			}
			return false;
		}
		
		function hidePlaceholderContainer() {
			if(this.target.getAttr('readonly') && !this.getText())
				return;
			getContainer('placeholder', this).hide();
		}
		
		function showPlaceholderContainer() {
			var placeholderContainer = getContainer('placeholder', this);
			if(this.getText()){
				placeholderContainer.hide();
			} else {
				placeholderContainer.show();
			}
		}
		
		function showTip(result){
			var tip = getContainer('tip', this);
			if(tip){
				if(result){
					tip.show(duration, null, 'opacity');
					tip.setHtml(result).removeClass('x-tipbox-success x-tipbox-plain').addClass('x-tipbox x-tipbox-error');
					updateControl(false, this);
				} else {
					var msgSuccess = this.target.getAttr('msg-success');
					if(msgSuccess) {
						tip.show(duration, null, 'opacity');
						tip.setHtml(msgSuccess).removeClass('x-tipbox-error x-tipbox-plain').addClass('x-tipbox x-tipbox-success');
					} else if(msgSuccess !== ''){
						tip.show(duration, null, 'opacity');
						tip.setHtml('&nbsp;').removeClass('x-tipbox-error').addClass('x-tipbox x-tipbox-success x-tipbox-plain');
					} else {
						tip.setHtml('&nbsp;').removeClass('x-tipbox-error').addClass('x-tipbox x-tipbox-success x-tipbox-plain');
						tip.hide();
					}
					updateControl(true, this);
				}
			}
		}
		
		function updateControl(success, validator){
			
			if(validator.target.hasClass('x-textbox')) {
				if(success) {
					validator.target.removeClass('x-textbox-error');
				} else {
					validator.target.addClass('x-textbox-error');
				}
			}
		}
		    
	    function createFormValidator(formElement){
	    	var group = new Validator.Group();
	    	group.target = Dom.get(formElement);
	    	
	    	initFunction(group, 'success');
	    	initFunction(group, 'error');
	    	initFunction(group, 'complete');
	    	
	    	group.target.on('submit', function(e){
	    	
	    		if(!group.validate())
	    			e.preventDefault();
	    	});
	    	
	    	
	    	return group;
	    }
	    
		function initForm (validator){
			var formElement = validator.target.node.form;
			if(!formElement){
				return;
			}
			
			var data = Dom.get(formElement).dataField();
			
			var formValidator = data.validatorGroup || (data.validatorGroup = createFormValidator(formElement))
			
			formValidator.push(validator);
			
		};
	
		return function(dom){
			var validator = new Validator(dom);
			
			// counter
			initCounter(validator);
			
			// 基本的验证支持。
			initBoolean(validator, 'required');
			initNumber(validator, 'maxLength');
			initNumber(validator, 'minLength');
			initRegExp(validator, 'pattern');
			
			if(validator.target.getAttr('dataType')){
				validator.set('dataType', validator.target.getAttr('dataType'), validator.target.getAttr('msg-error'));
			}
			
			// 重置提示。
			validator.on('reset', function(updateUI){
				var tip = getContainer('tip', this);
				if(tip){
					if(updateUI !== false) {
						tip.hide(duration, null, 'opacity');
					} else {
						tip[tip.getText() ? 'show' : 'hide']();
					}
				}
			});
			
			validator.showTip = showTip;
			
			// placeholder
			initPlaceholder(validator);
			
			// 绑定错误和成功后的提示。
			validator.on('complete', showTip);
			
			// 事件函数
			initFunction(validator, 'error');
			initFunction(validator, 'success');
			initFunction(validator, 'complete');
			initFunction(validator, 'reset');
			initFunction(validator, 'async');
			
			// 特殊的验证函数。
			var validate = validator.target.getAttr('onvalidate');
			
			if(validate){
				
				// 根据  validate 属性动态生成一个验证函数。 
				validator.validators.push(new Function('event', validate).bind(validator.target.node));
			}
			
			// 验证类型。
			var validateType = validator.target.getAttr('validateType') || 'keyup';
			
			if(validateType !== 'none') {
				validator.target.on(validateType, validator.validate, validator);
			
				if(validateType === 'keyup') {
					validator.target.on('blur', validator.validate, validator);
				}
			}
			
			// 如果缓存了值，则立即执行一次验证。
			if(validator.getText())
				validator.validate();
			else
				validator.reset(false);
			
			initForm(validator);
			
			validator.target.dataField().validator = validator;
			
			return validator;
		};
	
	})(),
	
	Group: Class({
		
		length: 0,
		
		push: Array.prototype.push,
		
		isValidateNeeded: function(validator){
			return !validator.isValidated;
		},
		
		validate: function(){
			var errorFields = [];
	        
	        for(var i = 0; i < this.length; i++){
	            if(this.isValidateNeeded(this[i]) && !this[i].validate()) {
	               errorFields.push(this[i]);
	            }
	        }
	        
	        if(!errorFields.length) {
	        	this.onSuccess(errorFields);
	        } else {
	        	this.onError(errorFields);	
	        }
	        
	        this.onComplete(errorFields);
	        
	        return errorFields.length === 0;
		},
		
		onSuccess: function(result){
			return this.trigger('success', result);
		},
		
		onError: function(result){
			if(result.length > 0) {
				result[0].target.scrollIntoView();
			}
			return this.trigger('error', result);
		},
		
		onComplete: function(result){
			return this.trigger('complete', result);
		}
		
	}),

	init: function(target){
		target = Dom.get(target) || document.body;
		
		target.query(':input').each(Validator.initTarget, Validator);
		
		if(/^(input|select|textarea)$/i.test(target.node.tagName)){
			Validator.initTarget(dom);
		}
	},
	
	getValidatorGroup: function(dom){
		dom = Dom.getNode(dom);
		assert(dom, "Validator.getFormValidator(dom): {dom} 不是合法的节点。", dom);
		return Dom.dataField(dom.form || dom).validatorGroup;
	},
	
	getValidator: function(dom){
		assert(Dom.getNode(dom), "Validator.getValidator(dom): {dom} 不是合法的节点。", dom);
		return Dom.dataField(Dom.getNode(dom)).validator || Validator.initTarget(dom);
	}
	
});




Object.extend(Validator.messages, {

    counterSuccess: '还可以输入<span class="x-counter-success"> {1} </span> 个字',

    counterError: '已超过<span class="x-counter-error"> {3} </span>个字'

});