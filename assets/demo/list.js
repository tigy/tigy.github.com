


Demo.writeList = function (list) {

    var html = '<style>ul.demo li{list-style:none;margin-left:20px;font-size:14px;}</style>', category, data, name;

    for (category in list) {

        data = list[category];

        html += '<section class="demo"><h3 class="demo">' + category + '</h3><ul class="demo">';

        for (name in data) {
            html += '<li><a class="demo" href="' + data[name] + '">' + name + '</a></li>';
        }

        html += '</ul></section>';
    }

    document.write(html);
};