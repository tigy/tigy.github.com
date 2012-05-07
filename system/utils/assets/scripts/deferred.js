/** * @author  *//** * 表示一个可以延时的操作。 */var Deferred = Class({    constructor: function() {        this._funs = [];        this._nextDef = null;        this._preDef = null;        this.isRunning = false;    },        then: function(f, arg) {        this._funs.push([f, arg]);    },        stop: function() {        //        this.pause();    },        abort: function() {        //        this.isRunning = false;        this._funs.length = 0;        this.pause();    },        pause: function() {        //        clearTimeout(this.timer);    },        done: function() {        //    },        run: function(args) {        this.timer = setTimeout(function(){trace(args);  this.next();}.bind(this), 1000);    },        start: function(args) {        this.then(this.run, args);        if (!this.isRunning) this.next();    },        next: function() {        if (this._funs.length)        {            this.isRunning = true;            var d2 = this._funs.shift();            d2[0].call(this, d2[1]);        }        else if (this._nextDef)        {            this.isRunning = false;            this.done();            this._nextDef.next();        }    },});Deferred.instances = {};
/**
 * 多个请求同时发生后的处理方法。
 * wait - 等待上个操作完成。
 * ignore - 忽略当前操作。
 * stop - 正常中断上个操作，上个操作的回调被立即执行，然后执行当前操作。
 * abort - 非法停止上个操作，上个操作的回调被忽略，然后执行当前操作。
 * replace - 替换上个操作为新的操作，上个操作的回调将被复制。
 */Deferred.link = function (deferredA, deferredB, linkType, type) {
	if (deferredA && deferredA.state === 'running') {
		switch (linkType) {
			case 'wait':
				// 将 deferred 放到等待队列。
				deferredA.then(function () {
					Deferred.instances[type] = this;
					this.start();
				}, deferredB);
				return deferredB;
			case 'stop':
				deferredA.stop();
				break;
			case 'abort':
				deferredA.abort();
				break;
				//case 'replace':
				//	deferredA.pause();
				//	deferredA.run = deferredB.run;
				//	deferredA.start();
				//	break;
			default:
				assert(!linkType || linkType === 'ignore', "Deferred.link(data): 成员 {link} 必须是 wait、cancel、ignore 之一。", linkType);
				return deferredB;
		}

	}
	//    Deferred.instances[type] = deferredB;	return deferredB.start();};