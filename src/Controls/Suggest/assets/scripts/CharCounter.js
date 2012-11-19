/** * @author xuld */var CharCounter = Control.extend({    maxLength: 300,    tpl: '<span class="x-charcounter"></span>',    update: function () {
        var len = this.target.getText().length - this.maxLength;        if (len > 0) {
            this.setHtml(String.format(CharCounter.errorMessage, len));
        } else {
            this.setHtml(String.format(CharCounter.successMessage, -len));
        }
    },    constructor: function (target, tip, maxLength) {        this.target = target = Dom.get(target);        tip = (tip ? Dom.get(tip) : target.siblings('.x-charcounter').item(0)) || target.after(this.tpl);        this.node = tip.node;        if(maxLength)            maxLength = this.maxLength;        target.on('keyup', this.update, this);        this.update();    }});CharCounter.successMessage = '还可以输入<span class="x-charcounter-success"> {0} </span> 个字',CharCounter.errorMessage = '已超过<span class="x-charcounter-error"> {0} </span>个字'