/**
 * @author
 */

/**
 * 用于异步执行任务时保证任务是串行的。
 */
var Deferrable = Class({

	chain: function (deferrable, args) {
		var lastTask = [deferrable, args];

		if (this._firstTask) {
			this._lastTask[2] = lastTask;
		} else {
			this._firstTask = lastTask;
		}
			
		this._lastTask = lastTask;
	},

	/**
	 * 多个请求同时发生后的处理方法。
	 * wait - 等待上个操作完成。
	 * ignore - 忽略当前操作。
	 * stop - 正常中断上个操作，上个操作的回调被立即执行，然后执行当前操作。
	 * abort - 非法停止上个操作，上个操作的回调被忽略，然后执行当前操作。
	 * replace - 替换上个操作为新的操作，上个操作的回调将被复制。
	 */
	defer: function (args, link) {

		var isRunning = this.isRunning;

		this.isRunning = true;

		if (!isRunning)
			return false;

		switch (link) {
			case undefined:
				break;
			case "abort":
				this.abort();
				return false;
			case "stop":
				this.stop();
				return false;
			case "ignore":
				return true;
			default:
				assert(!link || link === 'wait', "Deferred.prototype.defer(args, link): 成员 {link} 必须是 wait、cancel、ignore 之一。", link);
		}

		this.chain(this, args);

		return true;
	},

	/**
	 * 让当前队列等待指定的 deferred 全部执行完毕后执行。
	 */
	wait: function (deferred) {
		if (this.isRunning) {
			this.stop();
		}

		this.defer = deferred.defer.bind(deferred);
		this.progress = deferred.progress.bind(deferred);
	},

	progress: function () {

		var firstTask = this._firstTask;
		this.isRunning = false;

		if (firstTask) {
			this._firstTask = firstTask[2];
			
			firstTask[0].run(firstTask[1]);
		}

		
	},

	then: function (callback, args) {
		if (this.isRunning) {
			this.chain({
				owner: this,
				run: function (args) {
					if(callback.call(this.owner, args) !== false)
						this.owner.progress();
				}
			}, args);
		} else {
			callback.call(this, args);
		}
	},

	abort: function(){
		this.stop();
	},

	stop: function () {
		this.pause();
		this._firstTask = this._lastTask = null;
		this.isRunning = false;
	}

});
