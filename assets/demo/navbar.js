
Demo.writeNavBar = function (list) {


    var html = '<style>nav.demo-navbar {width: 200px;float: right;margin-left: 10px;margin-bottom: 20px;border: 1px solid #DDDDDD;border-radius: 4px 4px 4px 4px; padding: 10px;background: #F9F9F9;}nav.demo-navbar h3.demo {margin-top: 0; margin-bottom: 6px;} nav.demo ul.demo { margin-bottom: 10px;} nav.demo-navbar ul.demo li{list-style: none;}</style><article class="demo" style="margin-bottom:0;"><nav class="demo demo-navbar">', key, data, inUl = false;
    for (key in list) {

        if (list[key] === '-') {

            if (inUl) {
                html += '</ul>';
            }

            html += '<h3 class="demo">' + key + '</h3>';
            html += '<ul class="demo">';

            inUl = true;

            continue;

        } else if (!inUl) {
            html += '<ul>';
        }

        inUl = true;

        html += '<li><a class="demo" href="' + list[key] + '" title="' + key + '">' + key + '</a></li>';
        
    }

    html += '</ul></nav></article>';

    document.write(html);
};