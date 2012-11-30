/**
 * @author xuld
 */


using("System.Dom.Base");


Dom.implement({
	
    /**
     * ����һ���˵��ĵ����㡣
     */
	popup: function(options){
		
		if(options.constructor !== Object){
			options = {target: Dom.get(options)};
		}
		
        // �������������صġ�
		options.target.hide();

        // Ĭ���¼��� mouseenter
		options.event = options.event || 'mouseenter';
		
		var me = this, timer, atPopup, atTarget;

		if (/^mouse/.test(options.event)) {

		    options.delay = options.delay || 300;

		    options.target
                .on('mouseenter', function () {
                    atPopup = true;
                })
                .on('mouseleave', function () {
                    atPopup = false;
                });
		    
		    me.bind(options.event, function (e) {
		        
		        var target = this;

		        atTarget = true;

		        if (timer) {
		            clearTimeout(timer);
		        }
		        
		        timer = setTimeout(function () {

		            timer = 0;
		            
		            toggle('show', target);

		        }, options.delay);

		    });

		    me.bind(/^mouseenter/.test(options.event) ? options.event.replace('enter', 'leave') : options.event.replace('over', 'out'), function (e) {

		        var target = this;

		        atTarget = false;

		        if (timer) {
		            clearTimeout(timer);
		        }

		        timer = setTimeout(function () {

		            timer = 0;

		            if (!atTarget) {

		                if (!atPopup) {
		                    toggle('hide', target);

		                } else {
		                    setTimeout(arguments.callee, options.delay);
		                }

		            }

		        }, options.delay);

		    });

            // �����ֱ����ʾ��
		    me.bind(options.event.replace(/^\w+/, "click"), function (e) {

		        e.preventDefault();

		        if (timer) {
		            clearTimeout(timer);
		        }

		        toggle('show', this);

		    })

		} else if (/'focus(in)?\b/.test(options.event)) {

		    me.bind(options.event, function (e) {
		        toggle('show', this);
		    });

		    me.bind(/'focusin/.test(options.event) ? options.event.replace('focusin', 'focusout') : options.event.replace('focus', 'blur'), function (e) {
		        toggle('hide', this);
		    });

		} else {

		    me.bind(options.event, function (e) {

		        e.preventDefault();

                // �����ڵ㱻����ʱ����
		        if (options.target.isHidden()) {

		            var target = this;

		            toggle('show', target);

                    // ��ֹ�¼����ϱ�������
		            setTimeout(function () {

		                // �� click �����ز˵���
		                document.on('click', function (e) {
		                    
		                    // ����¼������ڵ����ϣ����ԡ�
		                    if (options.target.has(e.target, true)) {
		                        return;
		                    }

		                    toggle('hide', target);

		                    // ɾ�� click �¼��ص���
		                    document.un('click', arguments.callee);

		                });

		            }, 0);

		        }

		    });

		}

		function toggle(showOrHide, target) {

		    // ��ʾ�����ظ��㡣
		    options.target[showOrHide]();

		    // �ص���
		    if (options[showOrHide]) {
		        options[showOrHide](target);
		    }


		}
		
		return me;
		
	}

});