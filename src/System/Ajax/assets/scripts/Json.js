/**
 * AJAX 传输 JSON
 * @author xuld
 */

using("System.Ajax.Base");
using("System.Data.JSON");

Ajax.accepts.json = "application/json, text/javascript";
Ajax.dataParsers.json = function (xhrObject) {
    return JSON.parse(this.text(xhrObject));
};

Ajax.json = function (url, data, onsuccess) {
    if (typeof data === 'function') {
        onsuccess = data;
        data = null;
    }

    return Ajax.send({
        url: url,
        dataType: 'json',
        data: data,
        success: onsuccess
    });
};

