/**
 * @author xuld
 */
 
using("System.Core.Base");

/**
 * �����첽ִ������ʱ��֤�����Ǵ��еġ�
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
	 * �������ͬʱ������Ĵ�������
	 * wait - �ȴ��ϸ�������ɡ�
	 * ignore - ���Ե�ǰ������
	 * stop - �����ж��ϸ��������ϸ������Ļص�������ִ�У�Ȼ��ִ�е�ǰ������
	 * abort - �Ƿ�ֹͣ�ϸ��������ϸ������Ļص������ԣ�Ȼ��ִ�е�ǰ������
	 * replace - �滻�ϸ�����Ϊ�µĲ������ϸ������Ļص��������ơ�
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
            case "skip":
                this[link]();
                this.isRunning = true;
                return false;
            case "replace":
                this.init(this.options = Object.extend(this.options, args));

                // fall through
            case "ignore":
                return true;
            default:
                assert(link === "wait", "Deferred#defer(args, link): ��Ա {link} ������ wait��abort��stop��ignore��replace ֮һ��", link);
        }

        this.chain(this, args);
        return true;
    },

    /**
	 * �õ�ǰ���еȴ�ָ���� deferred ȫ��ִ����Ϻ�ִ�С�
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
                    if (callback.call(this.owner, args) !== false)
                        this.owner.progress();
                }
            }, args);
        } else {
            callback.call(this, args);
        }
        return this;
    },

    delay: function (duration) {
        return this.run({ duration: duration });
    },

    pause: Function.empty,

    skip: function () {
        this.pause();
        this.progress();
        return this;
    },

    abort: function () {
        this.pause();
        this._firstTask = this._lastTask = null;
        this.isRunning = false;
        return this;
    },

    stop: function () {
        return this.abort();
    }

});
