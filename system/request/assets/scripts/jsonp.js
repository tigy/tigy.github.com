/**
 * @fileOverview 请求处理JSON-P数据。
 * @author aki xuld
 */


using("System.Request.Base");

Request.JSONP = Request.Base.extend({

    onReadyStateChange: function(errorNo, message){
    	var me = this, script = me.script;
    	if (script && (exception || !script.readyState || !/in/.test(script.readyState))) {
        
            // 删除全部绑定的函数。
            script.onerror = script.onload = script.onreadystatechange = null;
            
            // 删除当前脚本。
            script.parentNode.removeChild(script);
            
            // 删除回调。
            delete window[me.callback];
            
            me.script = null;
            
            try {
            
            	if (exception) {

            		if (exception === 1) {
            			me.onError('Request Timeout');
					} else {
						me.onError('JSONP Error');
            		}

                }
                
                me.onComplete(script);
                
            } finally {
            
                script = null;
                
            }
        }
    },
    
    jsonp: 'callback',
    
    send: function(){
        var me = this, url = me.url, script, t;
        
        me.onStart(data);
        
        // 改成字符串。
        if (typeof data !== 'string') {
            
            data = me.toParam(data);
        }
        
        url = me.combineUrl(url, data);
        
        // 处理 callback=?
        var callback = me.callback || ( 'jsonp' + System.id++ );
        
        if(url.indexOf(me.jsonp + '=?') >= 0){
        	url = url.replace(me.jsonp + '=?', me.jsonp + '=' + callback);
        } else {
      		url = me.combineUrl(url, me.jsonp + "=" + callback);
      	}
        
        script = me.script = document.createElement("script");
        t = document.getElementsByTagName("script")[0];
        
        window[callback] = function(){
        	delete window[callback];
            me.onSuccess.apply(me, arguments);
        };
        
        script.src = url;
        script.type = "text/javascript";
        
        script.onerror = function(){
            me.onReadyStateChange(1);
        };
        
        if (me.timeouts > 0) {
        	setTimeout(script.onerror, function () {
        		me.onReadyStateChange(2);
        	});
        }
        
        script.onload = script.onreadystatechange = function(){
            me.onReadyStateChange();
        };
        
        t.parentNode.insertBefore(script, t);
    },
    
    abort: function(){
        this.onAbort();
        this.onReadyStateChange('Aborted');
    }
});
