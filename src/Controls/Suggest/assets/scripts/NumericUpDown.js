/**
 * @author xuld
 */


using("Controls.Suggest.UpDown");

var NumericUpDown = UpDown.extend({

    delta: 1,

    onUp: function () {
        this.setText((this.getText() || 0) + delta);
    },

    onDown: function () {
        this.setText((this.getText() || 0) - delta);
    }

});