var utils = (function () {
    /**
     * [likeArray 类数组转化为数组]
     * @param  {[object]} list [要转化的类数组]
     * @return [Array]        [转化后的新数组]
     */
    function likeArray(list) {
        try { // 方案一
            return [].slice.call(list, 0); // 不兼容（ie8- 元素集合和节点集合） 利用call方法改变slice中的this
        } catch (e) { // 方案二 兼容写法
            var arr = [];
            for (var i = 0; i < list.length; i++) { // 将类数组中的每一项 取出来依次放到 arr这个数组里面
                arr.push(list[i]);
            }
            return arr;
        }
    }

    /**
     * [toJson 将JSON字符串转换为JSON对象]
     * @return [object] [JSON对象]
     */
    function toJson(jsonStr) {
        return "JSON" in window ? JSON.parse(jsonStr) : eval('(' + jsonStr + ')');
    }

    /**
     *   获取document文档的一些盒模型样式属性值 获取或设置
     * @param attr 设置属性 （只有一个参数是获取）
     * @param val  设置的属性值
     * @returns {val}
     */
    function win(attr, val) {
        if (typeof val === 'undefined') { // 如果第二个参数没传就是获取值
            return document.documentElement[attr] || document.body[attr];
        }
        // 否则就是 设置值
        document.documentElement[attr] = val;
        document.body[attr] = val;
    }

    /**
     * offset 获取当前元素距离body左偏移和上偏移的距离
     * @param ele
     * @returns {left: l,top:t}  左偏移和上偏移
     */
    function offset(ele) {
        var l = ele.offsetLeft;
        var t = ele.offsetTop;
        var par = ele.offsetParent;
        while (par && par.nodeName.toUpperCase() != 'BODY') {
            l += par.clientLeft + par.offsetLeft;
            t += par.clientTop + par.offsetTop;
            par = par.offsetParent;
        }
        return {left: l, top: t};
    }

    /**
     * getCss 获取元素样式
     * @param ele (指定元素)
     * @param attr (样式属性)
     */
    function getCss(ele, attr) {
//        window.getComputedStyle
        var val;
        if ("getComputedStyle" in window) { // 如果window上有这个属性我们就用
            val = window.getComputedStyle(ele, null)[attr];
        } else { //ie Low currentStyle
            //  oDiv.currentStyle.filter  "alpha(opacity=80)"
            if (attr === 'opacity') { // ie8 low
                val = ele.currentStyle.filter; // "alpha(opacity=80)"
                var reg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/;
                // 判断ie下有没有设置透明度 如果没有 默认返回1
                val = reg.test(val) ? (reg.exec(val)[1]) / 100 : 1; // ["alpha(opacity=80)", "80"]
            } else {
                val = ele.currentStyle[attr];
            }

        }
//           100px -100px -1.23px   12rem  1em  block
        // 把带单位的去掉 把数字提取出来 即使是字符串数字 我也要提取成数字在返回 预防后期累加使用
        var regs = /^-?\d+(\.\d+)?(px|pt|rem|em)?$/;
        return regs.test(val) ? parseFloat(val) : val;
    }

    /**
     * setCss 给元素设置样式
     * @param ele   （要设置的元素）
     * @param attr  （要设置的属性）
     * @param val   （样式属性值）
     */
    function setCss(ele, attr, val) {
        if (attr === 'opacity') { // 透明度处理
            ele.style['opacity'] = val; // 其他浏览器
            ele.style['filter'] = 'alpha(opacity=' + val * 100 + ')'; // ie 低版本
            return;
        }
        if (attr === 'float') {
            ele.style.cssFloat = val; // 老版本 ff
            ele.style.styleFloat = val; // ie 低版本
            return;
        }
        // 如果是这些属性 为确保 传递进来的值 有单位
        var reg = /^width|height|top|bottom|left|right|((margin|pading)(Top|Left|Bottom|Right)?)$/;
        if (reg.test(attr)) {
            if (!isNaN(val)) {
                val += 'px';
            }
        }
        ele.style[attr] = val;
    }

    /**
     * getByClass 通过类名获取元素
     * @param cName 类名
     * @param context 获取的上下文
     * @return {NodeList} 匹配的元素集合
     */
    function getByClass(cName, context) {
        context = context || document;
        cName = cName.replace(/^ +| +$/g, '');
        var classArr = cName.split(/ +/);
        var eles = context.getElementsByTagName('*');
        for (var i = 0; i < classArr.length; i++) {
            var reg = new RegExp("(^| )" + classArr[i] + "( |$)");
            var nameArr = [];
            for (var j = 0; j < eles.length; j++) {
                var eleName = eles[j].className;
                if (reg.test(eleName)) {
                    nameArr.push(eles[j]);
                }
            }
            eles = nameArr;
        }
        return eles;
    }

    /**
     * hasClass 检测指定元素中是否存在cName类名
     * @param ele  当前元素
     * @param cName 类名
     * @return {boolean} 有 true 无 false
     */
    function hasClass(ele, cName) {
        return (new RegExp('(^| )' + cName + '( |$)')).test(ele.className);
    }

    /**
     * addClass 给指定元素增加类名
     * @param ele 指定元素
     * @param cName 要增加的类名
     */
    function addClass(ele, cName) {
        cName = cName.replace(/^ +| +$/g, '');
        var arrName = cName.split(/ +/);
        for (var i = 0; i < arrName.length; i++) {
            if (!hasClass(ele, arrName[i])) {
                ele.className += ' ' + arrName[i];
                console.log(ele.className);
            }
        }
    }

    /**
     * removeClass 移除元素指定类名
     * @param ele 指定元素
     * @param cName 要移除的类名
     * @return {boolean}
     */
    function removeClass(ele, cName) {
        cName = cName.replace(/^ +| +$/g, '');
        var arrName = cName.split(/ +/);
        for (var i = 0; i < arrName.length; i++) {
            var cur = arrName[i];
            if (hasClass(ele, cur)) {
                var reg = new RegExp('(^| )' + cur + '( |$)');
                ele.className = ele.className.replace(reg, ' ');
            }
        }
        return true;
    }

    /**
     * toggle 切换类名 如果有就移除 无就增加
     * @param ele 指定元素
     * @param cName  类名可传递多个
     */
    function toggle(ele, cName) {
        var arr = [].slice.call(arguments, 1);
        for (var i = 0; i < arr.length; i++) {
            if (hasClass(ele, arr[i])) {
                removeClass(ele, arr[i]);
            } else {
                addClass(ele, arr[i]);
            }
        }
    }

    return { // 将写好的方法 放到这个对象里 并且返回到外面
        likeArray: likeArray,
        toJson: toJson,
        win: win,
        offset: offset,
        getCss: getCss,
        setCss: setCss,
        getByClass: getByClass,
        hasClass,
        addClass,
        removeClass: removeClass,
        toggle: toggle
    }
})();
