/**
 * @author
 */

/**
 * 表示一个可以延时的操作。
 */
var Deferred = Class({
	
	currentHandler: null,
	
	constructor: function() {
		this._handlers = [];
		Object.each(arguments, this.add, this);
	},

	/**
	 *
	 * @param deferrable deferrable 是一个对象，该对象必须存在这些方法：
	 *		run - 执行当前函数。
	 *		abort - 禁止执行。
	 */
	add: function (deferrable, args) {
		this._handlers.push([deferrable, args]);
	},
	
	then: function (fn, args) {
		if (this.isRunning) {
			fn.call(this, args);
		} else {
			this.add({
				run: function (args, deferred) {
					fn.call(deferred, args);
					deferred.progress();
				},
				abort: Function.empty
			}, args);
		}
	},
	
	stop: function() {
		this.pause();
	},
	
	abort: function() {
		this.currentHandler = null;
		if (this._handlers.length) {

			if(this._handlers[0][0] !== this){
				this._handlers[0][0].abort();
			}
			
			this._handlers.length = 0;
		}
		this.pause();
	},
	
	pause: function() {
		clearTimeout(this.timer);
	},
	
	done: function() {
		this.deferred.progress();
	},
	
	run: function (args, deferred) {
		this.deferred = deferred;
		this.timer = setTimeout( function() {
			trace(args);
			this.progress();
		}.bind(this), 1000);
	},
	
	start: function (args) {
		this.add(this, args);
		if (!this.isRunning) {
			this.progress();
		}
	},
	
	progress: function () {
		if (this._handlers.length) {
			var nextHandler = this._handlers.shift();
			this.currentHandler = nextHandler[0];
			nextHandler[0].run(nextHandler[1], this);
		} else {
			if (this.deferred !== this) {
				this.done();
			}
			this.currentHandler = null;
		}
	}
});

/**
 * 连接指定的 deferreds ，创建新的 Deferred
 */
Deferred.when = function (deferreds) {


};

Deferred.instances = {};

/**
 * 多个请求同时发生后的处理方法。
 * wait - 等待上个操作完成。
 * ignore - 忽略当前操作。
 * stop - 正常中断上个操作，上个操作的回调被立即执行，然后执行当前操作。
 * abort - 非法停止上个操作，上个操作的回调被忽略，然后执行当前操作。
 * replace - 替换上个操作为新的操作，上个操作的回调将被复制。
 */
Deferred.link = function(deferredA, deferredB, linkType, type) {

	if(deferredA && deferredA.state === 'running') {
		switch (linkType) {
			case 'wait':
				// 将 deferred 放到等待队列。
				deferredA.then(function() {
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

	//    Deferred.instances[type] = deferredB;
	return deferredB.start();
};
