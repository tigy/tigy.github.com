/**
 * @author xuld
 */


using('System.Fx.Animate');


var ScrollToTop = Control.extend({

    tpl: '<a href="#" class="x-scrolltotop">»Øµ½¶¥²¿</a>',

    showDuration: -1,

    scrollDuration: -1,

    minScroll: 130,

    onClick: function (e) {
        e.preventDefault();
        Dom.document.animate({scrollTop: 0}, this.scrollDuration);
    },

    init: function (options) {
        var me = this;
        document.on('scroll', function () {
            if (document.getScroll().y > me.minScroll) {
                me.show(me.showDuration);
            } else {
                me.hide(me.showDuration);
            }
        });
        this.on('click', this.onClick);
    }

});