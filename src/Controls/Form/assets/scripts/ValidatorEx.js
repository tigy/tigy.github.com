/** * @author xuld */Validator.initTarget = (function(){})();

Object.extend(Validator, {

    initTarget: (function () {

        var duration = 100;

        function getContainer(type, validator) {
            type += 'Container';
            var id = validator.target.getAttr(type);
            id = id && Dom.get(id);
            if (id)
                return id;

            id = validator.target.getAttr('id');
            return id && Dom.get(id + '.' + type);
        }

        function initFunction(validator, attrName) {
            var val = validator.target.getAttr('onvalidate' + attrName);

            if (val == undefined)
                return;

            val = new Function('event', val);

            validator.on(attrName, val, validator.target.node);
        }

        function initRegExp(validator, attrName) {
            var val = validator.target.getAttr(attrName);
            if (val == undefined)
                return;

            validator.target.setAttr(attrName, null);

            val = new RegExp(val);

            validator.set(attrName, val, validator.target.getAttr('msg-' + attrName));
        }

        function getAttrNumber(validator, attrName) {
            var val = validator.target.getAttr(attrName);
            if (val == undefined)
                return -1;

            if (typeof val !== 'number') {
                val = +val;
                if (isNaN(val)) {
                    return -1;
                }
            }

            return val;
        }

        function initNumber(validator, attrName) {
            var val = getAttrNumber(validator, attrName);
            if (val >= 0) {
                validator.target.setAttr(attrName, null);
                validator.set(attrName, val, validator.target.getAttr('msg-' + attrName));
            }
        }

        function initBoolean(validator, attrName) {
            var val = validator.target.getAttr(attrName);
            if (val == undefined)
                return;

            validator.target.setAttr(attrName, null);

            if (typeof val !== 'boolean') {
                val = val && !/^false$/i.test(val);
            }

            validator.set(attrName, val, validator.target.getAttr('msg-' + attrName));
        }  

        function createFormValidator(formElement) {
            var group = new Validator.Group();
            group.target = Dom.get(formElement);

            initFunction(group, 'success');
            initFunction(group, 'error');
            initFunction(group, 'complete');

            group.target.on('submit', function (e) {

                if (!group.validate())
                    e.preventDefault();
            });


            return group;
        }

        function initForm(validator) {
            var formElement = validator.target.node.form;
            if (!formElement) {
                return;
            }

            var data = Dom.get(formElement).dataField();

            var formValidator = data.validatorGroup || (data.validatorGroup = createFormValidator(formElement))

            formValidator.push(validator);

        };

        return function (dom) {
            var validator = new Validator(dom);

            // counter
            initCounter(validator);

            // 基本的验证支持。
            initBoolean(validator, 'required');
            initNumber(validator, 'maxLength');
            initNumber(validator, 'minLength');
            initRegExp(validator, 'pattern');

            if (validator.target.getAttr('dataType')) {
                validator.set('dataType', validator.target.getAttr('dataType'), validator.target.getAttr('msg-error'));
            }

            // 重置提示。
            validator.on('reset', function (updateUI) {
                var tip = getContainer('tip', this);
                if (tip) {
                    if (updateUI !== false) {
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

            if (validate) {

                // 根据  validate 属性动态生成一个验证函数。 
                validator.me.push(new Function('event', validate).bind(validator.target.node));
            }

            // 验证类型。
            var validateType = validator.target.getAttr('validateType') || 'keyup';

            if (validateType !== 'none') {
                validator.target.on(validateType, validator.validate, validator);

                if (validateType === 'keyup') {
                    validator.target.on('blur', validator.validate, validator);
                }
            }

            // 如果缓存了值，则立即执行一次验证。
            if (validator.getText())
                validator.validate();
            else
                validator.reset(false);

            initForm(validator);

            validator.target.dataField().validator = validator;

            return validator;
        };

    })(),

    init: function (target) {
        target = Dom.get(target) || document.body;

        target.query(':input').each(Validator.initTarget, Validator);

        if (/^(input|select|textarea)$/i.test(target.node.tagName)) {
            Validator.initTarget(dom);
        }
    },

    getValidatorGroup: function (dom) {
        dom = Dom.getNode(dom);
        assert(dom, "Validator.getFormValidator(dom): {dom} 不是合法的节点。", dom);
        return Dom.dataField(dom.form || dom).validatorGroup;
    },

    getValidator: function (dom) {
        assert(Dom.getNode(dom), "Validator.getValidator(dom): {dom} 不是合法的节点。", dom);
        return Dom.dataField(Dom.getNode(dom)).validator || Validator.initTarget(dom);
    }

});


Object.extend(Validator.messages, {

    

});


//// 不存在指定的验证器。直接返回 true 。
//if (!me) {
//    return true;
//}

Object.extend(Validator, {

    _initFunction: function (target, attrName) {
        var attrValue = target.getAttr('onvalidate' + attrName);
        if (attrValue)
            return new Function('event', attrValue);
    },

    init: function (dom) {
        var validator = {
            target: dom,
            validate: this._initFunction(dom, ''),
            start: this._initFunction(dom, 'start'),
            success: this._initFunction(dom, 'success'),
            error: this._initFunction(dom, 'error'),
            complete: this._initFunction(dom, 'complete')
        };
        if (dom.node.tagName === 'FORM') {
            validator = ;

            new Validator.Form();
        } else {
            
            if(dom.getAttr('required'))
                validator.required = true;

            if(dom.getAttr('maxLength'))
                // 基本的验证支持。
                initNumber(validator, 'maxLength');
            initNumber(validator, 'minLength');
            initRegExp(validator, 'pattern');
        }
        dom.dataField().validator = dom;
    },

    get: function (dom) {
        dom = Dom.get(dom);
        return dom.dataField().validator || Validator.init(dom);
    }

});



