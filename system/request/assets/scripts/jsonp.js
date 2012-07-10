/**
 * @fileOverview 请求处理JSON-P数据。
 * @author xuld
 */


using("System.Request.Base");

Request.JSONP = Request.Base.extend({

	jsonp: 'callback',

	success: Function.empty,

    onStateChange: function(errorNo, message){
    	var me = this, script = me.script;
    	if (script && (errorNo || !script.readyState || !/in/.test(script.readyState))) {
        
            // 删除全部绑定的函数。
            script.onerror = script.onload = script.onreadystatechange = null;
            
            // 删除当前脚本。
            script.parentNode.removeChild(script);
            
    		// 删除回调。
			window[me.callback] = undefined;
            
            me.script = null;
            
            try {
            
            	if (errorNo && me.error) {
					me.error(errorNo, message, script);
				}
                
            	if (me.complete) {
            		me.complete(script, message, errorNo);
            	}
                
            } finally {
            
                script = null;

				me.progress();
            }
        }
    },
    
    send: function(){
    	
    	var me = this,
			url = me.initUrl(me.url),
			data = me.initData(me.data),
			script,
			t;
        
    	url = Request.combineUrl(url, data);

    	// 处理 callback=?
    	var callback = me.callback || ('jsonp' + Date.now());

    	if (me.jsonp) {

    		if (url.indexOf(me.jsonp + '=?') >= 0) {
    			url = url.replace(me.jsonp + '=?', me.jsonp + '=' + callback);
    		} else {
    			url = Request.combineUrl(url, me.jsonp + "=" + callback);
    		}

    	}
        
        script = me.script = document.createElement("script");

        if (me.start)
        	me.start(data, me.script);
        
        window[callback] = function(){
        	window[callback] = undefined;

        	return me.success.apply(me, arguments);
        };
        
        script.src = url;
        script.type = "text/javascript";

        script.onload = script.onreadystatechange = function () {
        	me.onStateChange();
        };
        
        script.onerror = function(){
        	me.onStateChange(1);
        };
        
        if (me.timeouts > 0) {
        	setTimeout(function () {
        		me.onStateChange(-1);
			}, me.timeouts);
        }

        t = document.getElementsByTagName("script")[0];
        t.parentNode.insertBefore(script, t);
    }
});
