/** * @author  *//** * 表示一个可以延时的操作。 */var Deferred = Class({

	state: 'inited',

	queue: 0,
	/**	 * 实际执行的函数。	 */	run: Function.empty,

	then: function (fn, bind) {
		return this.once('done', fn, bind);
	},	start: function () {
		this.state = 'running';		this.run();		return this;
	},	pause: function () {
		this.state = 'pause';
	},	stop: function () {
		this.pause();
		this.state = 'stopped';		this.trigger('done');
	},	defer: function(timeout){		var me = this;		return setTimeout(function () {
			me.start();
		}, timeout || 0);	},	concat: function(deferred){		if (!this.queue) {
			this.queue = [];		}		this.queue.push(deferred);	},	/**	 * 调用下一个关联的 Deferred 对象。	 */	progress: function () {		if (this.queue.length) {
			this.queue.shift()
				.once('alldone', function () {
					this.progress();
				}, this)
				.start();
		} else {
			this.trigger('alldone');		}	},	abort: function () {
		this.state = 'abort';
		this.un('done');
		this.progress();
	},	done: function (args) {
		this.state = 'done';
		this.trigger('done', args);
		this.progress();	}
});Deferred.instances = {};
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