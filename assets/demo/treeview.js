


Demo.writeTreeView = function (list) {
    document.write('<ul class="demo">');
    for (var item in list) {
        document.write('<li>');
        if (typeof list[item] === 'string') {
            document.write('<a class="demo" href="' + list[item] + '" target="_blank">');
            item = item.split(/\s*-\s*/);
            if (item[0].charAt(0) === '#') {
                document.write('<strong>');
                document.write(item[0].substring(1));
                document.write('</strong>');
            } else {
                document.write(item[0]);
            }

            document.write('</a>');
            if (item[1]) {
                document.write('<span> - <span class="demo-hint">');
                document.write(item[1]);
                document.write('</span></span>');
            }
        } else {
            document.write(item);
            Demo.writeTreeView(list[item]);
        }
        document.write('</li>');
    }
    document.write('</ul>');
};