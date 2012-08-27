/**
 * @author xuld
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

	progress: function () {

		var firstTask = this._firstTask;
		this.isRunning = false;

		if (firstTask) {
			this._firstTask = firstTask[2];
			
			firstTask[0].run(firstTask[1]);
		}

		return this;
		
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
			case "stop":
				this[link]();
				this.isRunning = true;
				return false;
			case "replace":
				this.init(this.options = Object.extend(this.options, args));
				
			// fall through
			case "ignore":
				return true;
			default:
				assert(link === "wait", "Deferred#defer(args, link): 成员 {link} 必须是 wait、abort、stop、ignore、replace 之一。", link);
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
		return this;
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
		return this;
	},
	
	pause: Function.empty,
	
	skip: function(){
		this.pause();
		this.progress();
		return this;
	},
	
	abort: function(){
		this.pause();
		this._firstTask = this._lastTask = null;
		this.isRunning = false;
		return this;
	},

	stop: function () {
		return this.abort();
	}

});
