
function getClasses() {

    /*

     {
        Class1: {
            extends; '',
            impelemts: ['IInput', 'IInput']
            type: 'classs',
            fields: {
                'aaa': 1,
                'gggg': 2,
                'rrrr': 4
            },
            methods: {
                'aaa': function(){}
            },
            events: {

            }
        }
    */

    return {

        Class1: {
            fields: {
                'aaa': 1,
                'gggg': 2,
                'rrrr': 4
            }
        },

        Class2: {
            extend: 'Class1',
            type: '类',
            implements: ['IIgasdas', 'IIccad'],
            fields: {
                'aaa': 1,
                'gggg': 2,
                'rrrr': 4
            },
            methods: {
                'aaa': function () { }
            }
        },

        Class3: {
            extend: 'Class1',
            type: '类',
            fields: {
                'aaa': 1,
                'gggg': 2,
                'rrrr': 4
            },
            methods: {
                'aaa': function () { }
            }
        },

        Class7: {
            extend: 'Class1',
            type: '类',
            fields: {
                'aaa': 1,
                'gggg': 2,
                'rrrr': 4
            },
            methods: {
                'aaa': function () { }
            }
        },

        Class76: {
            type: '类',
            fields: {
                'aaa': 1,
                'gggg': 2,
                'rrrr': 4
            },
            methods: {
                'aaa': function () { }
            }
        },

        Class76234: {
            type: '类',
            fields: {
                'aaa': 1,
                'gggg': 2,
                'rrrr': 4
            },
            methods: {
                'aaa': function () { }
            }
        },

        Class76231231234: {
            type: '类',
            fields: {
                'aaa': 1,
                'gggg': 2,
                'rrrr': 4
            },
            methods: {
                'aaa': function () { }
            }
        },

        Class645: {
            extend: 'Class76231231234',
            type: '类',
            fields: {
                'aaa': 1,
                'gggg': 2,
                'rrrr': 4
            },
            methods: {
                'aaa': function () { }
            }
        }



    };

}

// 参数

var simpleClassColumn = 9;
var objectWidth = 150;
var objectHeight = 57;
var objectMarginRight = 30;
var objectMarginBottom = 90;
var implementHeight = 34;
var implementOffset = 20;
var padding = 40;

var members = {
    'field': '字段',
    'method': '方法',
    'event': '事件'
};

// 绘图

// 分析类的列表并返回类树。
function getClasssDom(classes) {

    var r = [];

    // 统计每个类的直接子类

    for (var className in classes) {

        var clazz = classes[className];

        clazz.name = className;

        // 如果存在继承，则放到对应父类的 children 属性。
        if (clazz.extend && classes[clazz.extend]) {

            var parentClass = classes[clazz.extend];

            // 第一次添加时，初始化 children 属性。
            if (!parentClass.children) {
                parentClass.children = [];
            }

            parentClass.children.push(clazz);

        } else {

            // 否则，它被添加到全局数组里。
            r.push(clazz);

        }

    }

    // 统计每个类的全部子类个数

    getCount(r, 0);

    function getCount(children, row) {

        var rowCount = 0;
        var colCount = 0;

        for (var i = 0; i < children.length; i++) {

            children[i].row = row;
            children[i].col = colCount;

            if (children[i].children) {
                var t = getCount(children[i].children, row + 1);
                colCount += t[1];

                children[i].rowCount = t[0];
                children[i].colCount = t[1];
            } else {
                children[i].colCount = children[i].rowCount = 1;
                colCount++;
            }

            if (rowCount < children[i].rowCount) {
                rowCount = children[i].rowCount;
            }

        }

        return [rowCount + 1, colCount];
    }

    // 根据体系大小排序

    r.sort(function (x, y) {
        return x.colCount > y.colCount;
    });

    //for (var i = 0, col = 0; i < r.length; i++) {

    //    if (r[i].colCount === 0) {

    //        r[i].row = maxRow;
    //        r[i].col = col;

    //        if (++col >= simpleClassColumn) {
    //            maxRow++;
    //        }

    //    }

    //}

    return r;

    /*

    [
        name: 'Class1',
        type: '类',
        count: 5,
        children: [{
            name: 'Class1',
            type: '类',
        }]
    */
}

function paintClassDom(classes) {

    var classDom = window.h = getClasssDom(classes);

    // 每个类的宽度。
    var html = '';

    for (var i = 0; i < classDom.length; i++) {
        drawSignleObject(classDom[i]);
    }

    document.getElementById('body').innerHTML = html;

    // 绘制单一的对象。
    function drawSignleObject(clazz) {

        var x = padding + clazz.col * (objectWidth + objectMarginRight);
        var y = padding + clazz.row * (objectHeight + objectMarginBottom);

        var width = objectWidth * clazz.colCount + (clazz.colCount - 1) * objectMarginRight;

        clazz.x =x + (width - objectWidth) / 2;
        clazz.y = y;
        clazz.width = width;

        html += drawObject(clazz);

        if (clazz.implements) {
            html += drawVerticalCircle(clazz.x + objectWidth / 2 + implementOffset, clazz.y - implementHeight, implementHeight);
            html += drawText(clazz.implements.join(','), clazz.x + objectWidth / 2 + implementOffset + 18, clazz.y - implementHeight - 4);
        }

        // 如果有子对象。画一个继承的箭头。
        if (clazz.children) {

            for (var i = 0; i < clazz.children.length; i++) {
                drawSignleObject(clazz.children[i]);
            }

            html += drawVerticalArrow(x + width / 2, y + objectHeight, objectMarginBottom / 2);

            y = y + objectHeight + objectMarginBottom / 2;

            html += drawHorizonalLine(clazz.children[0].x + objectWidth / 2, y, clazz.children[clazz.children.length - 1].x - clazz.children[0].x);

            for (var i = 0; i < clazz.children.length; i++) {

                html += drawVerticalLine(clazz.children[i].x + objectWidth / 2, y, objectMarginBottom / 2);

            }
        }

    }

}

// 绘图底层

function drawObject(clazz) {
    var html = '';

    var extend = clazz.extend || 'Object';
    html += '<aside class="object collapsed" style="left:' + clazz.x + 'px;top:' + clazz.y + 'px"><header><div class="collapse"></div><h4 title="' + clazz.name + '">' +   clazz.name + '</h4><div class="info"><span class="rightarrow"></span><a href="#">' + extend + '</a></div>';

    html += '</header><dl>';

    for (var memberType in members) {

        var t = clazz[memberType + 's'];

        if (t) {
            html += '<dt>' + members[memberType] + '</dt>';

            for (var field in clazz[memberType + 's']) {
                html += '<dd><span class="icon-member icon-' + (t[field].static ? 'static' : 'none') + '"></span><span class="icon-member icon-' + memberType + '"></span><a href="#" class="member-' + t[field].attribute + '">' + field + '</a></dd>';
            }
        }
    }

    html += '</dl></aside>';

    return html;
}

function drawHorizonalLine(x, y, width) {
    return '<div class="line-horizonal" style="top:' + y + 'px;left:' + x + 'px;width:' + width + 'px"></div>';
}

function drawVerticalLine(x, y, height) {
    return '<div class="line-vertical" style="left:' + x + 'px;top:' + y + 'px;height:' + height + 'px"></div>';
}

function drawVerticalArrow(x, y, height) {

    return '<div class="arrow-top" style="left:' + (x - 5) + 'px;top:' + y + 'px;">△</div>' + drawVerticalLine(x, y + 14, height - 14);
}

function drawText(text, x, y) {

    return '<div style="left:' + (x - 5) + 'px;top:' + y + 'px;">' + text + '</div>';
}

function drawVerticalCircle(x, y, height) {

    return '<div class="arrow-circle" style="left:' + (x - 5) + 'px;top:' + (y - 2) + 'px;">◦</div>' + drawVerticalLine(x, y + 12, height - 12);
}

function testDraw(func, args0, args1, args2) {
    var func = arguments[0];
    document.getElementById('body').innerHTML = func.call(this, args0, args1, args2);
}

var zIndex = 1;

function initUI(){
    var body = Dom.get('body');
    body.delegate('.collapse', 'click', function () {
        this.parent().parent().toggleClass('collapsed');
    }).delegate('.object', 'click', function () {
        this.setStyle('zIndex', zIndex++);
    }).setStyle('cursor', 'move');


    var MyDraggable = Draggable.extend({

        beforeDrag: function (e) {
            var me = this;
            this.offset = body.getScroll();
            me.position = me.proxy.getPosition();
            me.size = me.proxy.getSize();
            me.droppables = [];
            me.activeDroppables = new Array(me.droppables.length);
            document.documentElement.style.cursor = this.target.getStyle('cursor');
            if ('pointerEvents' in document.body.style)
                document.body.style.pointerEvents = 'none';
            else if (document.body.setCapture)
                document.body.setCapture();
        },

        doDrag: function (e) {

            var me = this;

            body.setScroll(me.offset.x - me.to.x + me.from.x, me.offset.y - me.to.y + me.from.y);

            //var me = this;
            //me.proxy.setOffset({
            //    x: me.offset.x + me.to.x - me.from.x,
            //    y: me.offset.y + me.to.y - me.from.y
            //});
        }

    });


    new MyDraggable(body);
}

Dom.ready(initUI);