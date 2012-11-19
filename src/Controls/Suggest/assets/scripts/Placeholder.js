/** * @author xuld */var Placholder = Control.extend({
    maxLength: 300,    tpl: '<span class="x-placeholder"></span>',    update: function () {
        var len = this.target.getText().length - maxLength;        if (len > 0) {
            this.setHtml(String.format(CharCounter.errorMessage, len));
        } else {
            this.setHtml(String.format(CharCounter.successMessage, -len));
        }
    },    constructor: function (target, content, placeholder) {
        this.target = target = Dom.get(target);        tip = (tip ? Dom.get(tip) : target.siblings('.x-charcounter').item(0)) || target.after(this.tpl);        this.node = tip.node;        if (maxLength)            maxLength = this.maxLength;        target.on('keyup', this.update, this);        this.update();
    }
});