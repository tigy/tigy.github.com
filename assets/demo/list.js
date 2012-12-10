

/**
 * 将 Article.demo-grid 转为瀑布流。
 * @param {Integer} column 列号。
 */
Demo.waterFall = function (column) {
    
    document.write('<style>.list{margin:0!important;padding:0;} .list li{margin:0;list-style: disc inside;color: #E2E2EB;font-size: 12.5px;line-height: 24px;height: 24px;overflow: hidden;}h2.demo{border:0;}.list small {color: #999999;}.demo-grid h2.demo {margin-bottom: 14px;}.demo-grid section.demo { float: left; margin-right: 30px;}.demo-grid-6 section.demo {   width: 153.33333333333334px; margin-right: 10px;}.demo-grid-5 section.demo { width: 186px; margin-right: 10px;}.demo-grid-4 section.demo {width: 235px;margin-right: 10px;}.demo-grid-3 section.demo { width: 311px; margin-right: 10px;}</style>');

    var articles = document.getElementsByTagName("ARTICLE"),
        articlesIndex,
        sections,
        len,
        heights = [],
        section,
        min,
        minIndex,
        baseHeight = 40,
        marginRight = 10,
        marginBottom = 30,
        columnWidth,
        i,
        j;

    // 每个 ARTICLE 分开处理。
    for (articlesIndex = 0; articles[articlesIndex]; articlesIndex++) {
        if (articles[articlesIndex].className.indexOf("demo-grid") >= 0) {
            sections = articles[articlesIndex].getElementsByTagName("SECTION");
            len = sections.length;
            heights.length = 0;
            columnWidth = len && sections[0].offsetWidth + marginRight;

            // 第一行不处理。
            for (i = 0; i < column; i++) {
                if (section = sections[i]) {
                    heights[i] = baseHeight + section.offsetHeight + marginBottom;
                }
            }

            // 每个块依次选择合适的位置。
            for (i = column; i < len; i++) {
                min = Infinity;
                for (j = heights.length; --j >= 0;) {
                    if (min >= heights[j]) {
                        minIndex = j;
                        min = heights[j];
                    }
                }

                section = sections[i];
                section.style.position = 'absolute';
                section.style.top = min + 'px';
                section.style.left = minIndex * columnWidth + 'px';

                heights[minIndex] += section.offsetHeight + marginBottom;
            }

            max = 0;
            for (j = heights.length; --j >= 0;) {
                if (max < heights[j]) {
                    max = heights[j];
                }
            }

            articles[articlesIndex].style.height = max - 20 + 'px';
        }

    }

};

Demo.writeList = function (list, newWindow) {

    var html = '', category, data, name;
    for (category in list) {

        data = list[category];

        html += '<section class="demo"><h3 class="demo">' + category + '</h3><ul class="demo list">';

        for (name in data) {
            html += '<li><a ' + (newWindow ? ' target="_blank"' : '') + ' class="demo" href="' + data[name] + '" title="' + name + '">' + name + '</a></li>';
        }

        html += '</ul></section>';
    }

    document.write(html);
};