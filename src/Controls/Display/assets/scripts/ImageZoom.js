/**
 * @author sun
 */

$(function () {
    $('.x-imagezoom').addClass('x-imagezoom-small').each(function (index) {
        var $me = $(this);
        var img = new Image();

        img.onload = function () {
            $me.attr('data-ori', img.width);
        }

        img.src = $me.attr('src');

        if (window.navigator.isIE) $me.attr('data-ori', img.width);
    });


    $('.x-imagezoom').click(function (e) {
        var $me = $(this);
        var maxWidth = $me.parent().width();

        var orignalWidth = $me.attr('data-ori');

        if ($me.hasClass('x-imagezoom-small')) {
            $me.attr('data-small', $me.width());
            var w = maxWidth > orignalWidth ? orignalWidth : maxWidth;
            $me.width(w).removeClass('x-imagezoom-small').addClass('x-imagezoom-large');
        } else if ($me.hasClass('x-imagezoom-large')) {
            $me.width($me.attr('data-small')).removeClass('x-imagezoom-large').addClass('x-imagezoom-small');
        }
    });
})

