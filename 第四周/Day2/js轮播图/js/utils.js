String.prototype.myTrim = function myTrim() {
    if ('trim' in String.prototype) {
        return this.trim();
    }
    return this.replace(/^ +| +$/g, '');
};

var utils = (function () {
    function listToArray(likeAry) {
        var ary = [];
        try {
            ary = Array.prototype.slice.call(likeAry);
        } catch (e) {
            for (var i = 0; i < likeAry.length; i++) {
                ary.push(likeAry[i]);
            }
        }
        return ary;
    }

    /*
     * offset:模拟JQ中的OFFSET方法,获取当前元素距离BODY的偏移
     * @parameter
     *    curEle：current element 当前元素
     * @return
     *    {top:xxx,left:xxx} ->距离BODY的上偏移和左偏移
     */
    function offset(curEle) {
        var l = curEle.offsetLeft,
            t = curEle.offsetTop,
            p = curEle.offsetParent;
        while (p) {
            if (navigator.userAgent.indexOf('MSIE 8.0') === -1) {
                l += p.clientLeft;
                t += p.clientTop;
            }
            l += p.offsetLeft;
            t += p.offsetTop;
            p = p.offsetParent;
        }
        return {top: t, left: l}
    }

    /*
     * getCss：获取当前元素所有经过浏览器计算的样式(兼容全部的浏览器)
     * @parameter
     *   curEle：当前要操作的元素
     *   attr：当前要获取的样式属性名(字符串:'padding')
     * @return 
     *   获取的样式属性值
     */
    function getCss(curEle, attr) {
        var result = null,
            reg = null;
        if ('getComputedStyle' in window) {
            result = window.getComputedStyle(curEle, null)[attr];
        } else {
            if (attr === 'opacity') {
                result = curEle.currentStyle['filter'];
                reg = /^alpha\(opacity=(.+)\)$/;
                result = reg.test(result) ? reg.exec(result)[1] / 100 : 1;
            } else {
                result = curEle.currentStyle[attr];
            }
        }
        reg = /^-?(\d|([1-9]\d+))(\.\d+)?(px|em|rem|pt)?$/;
        reg.test(result) ? result = parseFloat(result) : null;
        return result;
    }

    /*
     * setCss：设置元素某一个样式属性的值(原理:设置当前元素的行内样式)
     * @parameter
     *   curEle：当前要操作的元素
     *   attr：当前要设置的样式属性名
     *   value：当前要设置的属性值(部分样式属性可以自动补充单位)
     */
    function setCss(curEle, attr, value) {
        if (arguments.length < 3) {
            return;
        }

        if (attr === 'float') {
            curEle['style']['cssFloat'] = value;
            curEle['style']['styleFloat'] = value;
            return;
        }

        if (attr === 'opacity') {
            curEle['style']['opacity'] = value;
            curEle['style']['filter'] = 'alpha(opacity=' + value * 100 + ')';
            return;
        }

        var reg = /^(width|height|((margin|padding)?(left|right|bottom|top))|fontSize)$/i;
        if (reg.test(attr)) {
            if (!isNaN(value)) {
                value = value + 'px';
            }
        }
        curEle['style'][attr] = value;
    }

    /*
     * setGroupCss：批量设置元素的CSS样式
     * @parameter
     *   curEle：当前要操作的元素
     *   options：当前要设置的样式属性集合(对象) {top:xxx,left:xxx...}
     * 原理：获取传递的属性集合,然后进行遍历循环,调取SET CSS方法依次设置即可
     */
    function setGroupCss(curEle, options) {
        if (typeof options !== 'object') return;
        for (var attr in options) {
            if (options.hasOwnProperty(attr)) {
                setCss(curEle, attr, options[attr]);
            }
        }
    }

    /*
     * css：把getCss/setCss/setGroupCss进行汇总,可以实现设置、获取和批量设置的功能 =>JQ中的CSS方法也是这样处理的
     */
    function css() {
        var len = arguments.length,
            curEle = arguments[0],
            attr = null,
            value = null,
            options = null;
        if (len === 3) {
            attr = arguments[1];
            value = arguments[2];
            setCss(curEle, attr, value);
            return;
        }

        if (len === 2 && typeof arguments[1] === 'object') {
            options = arguments[1];
            setGroupCss(curEle, options);
            return;
        }

        attr = arguments[1];
        return getCss(curEle, attr);
    }

    /*
     * getByClass：处理getElementsByClassName的兼容性的,通过样式类名来获取一组元素(元素集合=>HTMLCollection)
     * @parameter
     *    strClass：[string]需要操作的样式类名,例如：'w1'、'w2 w1'...
     *    context：[HTML Object]获取的上下文,获取元素的一个范围,不写默认是document在整个文档进行获取
     * @return
     *    [array] 我们匹配到的元素集合
     */
    function getByClass(strClass, context) {
        context = context || document;
        if ('getElementsByClassName' in document) {
            return listToArray(context.getElementsByClassName(strClass));
        }
        //->IE6~8
        var allNode = context.getElementsByTagName('*'),
            classList = strClass.replace(/^ +| +$/g, '').split(/ +/g),
            ary = [];
        for (var i = 0; i < allNode.length; i++) {
            var curNode = allNode[i],
                curName = curNode.className,
                flag = true;
            for (var j = 0; j < classList.length; j++) {
                var reg = new RegExp('\\b' + classList[j] + '\\b');
                if (!reg.test(curName)) {
                    flag = false;
                    break;
                }
            }
            flag ? ary.push(curNode) : null;
        }
        return ary;
    }

    /*
     * children：获取当前容器(元素)所有的元素子节点(在所有的子代元素中进行筛选),而且可以指定具体的标签名：假设传递了一个叫做div的标签名,就是先获取所有的子代元素标签,然后在把叫做div的筛选出来 =>JQ的children也是这个意思,只是不仅仅支持标签名的筛选,还可以支持样式类名等更复杂的筛选
     * @parameter
     *    curEle：当前需要操作的元素(容器)
     *    tagName：[string]进行二次筛选的标签名
     * @return
     *    [array] 获取到的元素集合
     */
    function children(curEle, tagName) {
        var allNodes = curEle.childNodes,
            elementAry = [];
        for (var i = 0; i < allNodes.length; i++) {
            var curNode = allNodes[i];
            if (curNode.nodeType === 1) {//->证明它是元素了
                var curNodeTag = curNode.tagName.toUpperCase();
                if (typeof tagName !== 'undefined') {
                    tagName = tagName.toUpperCase();
                    curNodeTag === tagName ? elementAry[elementAry.length] = curNode : null;
                    continue;
                }
                elementAry[elementAry.length] = curNode;
            }
        }
        return elementAry;
    }

    /*
     * hasClass：验证当前元素的样式类名中是否包含传递的这个样式类
     * @parameter
     *    curEle：当前需要操作的元素
     *    strClass：[string]需要检测的样式类名
     * @return
     *    true / false
     */
    function hasClass(curEle, strClass) {
        return new RegExp('\\b' + strClass + '\\b').test(curEle.className);
    }

    /*
     * addClass：给元素增加样式类名
     * @parameter
     *    curEle：当前需要操作的元素
     *    strClass：[string]需要增加的样式类名
     */
    function addClass(curEle, strClass) {
        var classList = strClass.myTrim().split(/ +/);
        for (var i = 0, len = classList.length; i < len; i++) {
            var curClass = classList[i];
            !hasClass(curEle, curClass) ? curEle.className += ' ' + curClass : null;
        }
        curEle.className = curEle.className.myTrim().replace(/ +/g, ' ');//->仅仅是为了保证元素的样式类集合规范一些:首尾空格去掉,中间只需要一个空格既可以隔开就好
    }

    /*
     * removeClass：给元素删除样式类名
     * @parameter
     *    curEle：当前需要操作的元素
     *    strClass：[string]需要移除的样式类名
     */
    function removeClass(curEle, strClass) {
        var classList = strClass.myTrim().split(/ +/);
        for (var i = 0, len = classList.length; i < len; i++) {
            var curClass = classList[i],
                reg = new RegExp('(^| +)' + curClass + '( +|$)', 'g');//->当前元素原有的样式类名中可能出现样式名重复的情况,所以我们的替换需要全局匹配替换
            if (hasClass(curEle, curClass)) {
                curEle.className = curEle.className.replace(reg, ' ');
            }
        }
    }

    /*
     * toggleClass：如果当前的样式类名在元素中存在我们就删除,不存在就增加
     * @parameter
     *    curEle：当前需要操作的元素
     *    strClass：[string]样式类名
     */
    function toggleClass(curEle, strClass) {
        var classList = strClass.myTrim().split(/ +/);
        for (var i = 0, len = classList.length; i < len; i++) {
            var curClass = classList[i];
            hasClass(curEle, curClass) ? removeClass(curEle, curClass) : addClass(curEle, curClass);
        }
    }

    /*
     * prev：获取上一个哥哥元素节点
     * @parameter
     *    curEle：当前需要操作的元素
     * @return
     *    存在返回哥哥元素节点,不存在返回null
     */
    function prev(curEle) {
        if ('previousElementSibling' in curEle) {
            return curEle.previousElementSibling;
        }
        var p = curEle.previousSibling;
        while (p && p.nodeType !== 1) {
            p = p.previousSibling;
        }
        return p;
    }

    /*
     * prevAll：获取所有哥哥元素节点
     * @parameter
     *    curEle：当前需要操作的元素
     * @return
     *    数组集合
     */
    function prevAll(curEle) {
        var ary = [],
            p = prev(curEle);
        while (p) {
            ary.unshift(p);
            p = prev(p);
        }
        return ary;
    }

    /*
     * next：获取下一个弟弟元素节点
     * @parameter
     *    curEle：当前需要操作的元素
     * @return
     *    存在返回弟弟元素节点,不存在返回null
     */
    function next(curEle) {
        if ('nextElementSibling' in curEle) {
            return curEle.nextElementSibling;
        }
        var n = curEle.nextSibling;
        while (n && n.nodeType !== 1) {
            n = n.nextSibling;
        }
        return n;
    }

    /*
     * nextAll：获取所有弟弟元素节点
     * @parameter
     *    curEle：当前需要操作的元素
     * @return
     *    数组集合
     */
    function nextAll(curEle) {
        var ary = [],
            n = next(curEle);
        while (n) {
            ary.push(n);
            n = next(n);
        }
        return ary;
    }

    /*
     * siblings：获取所有的兄弟元素节点
     * @parameter
     *    curEle：当前需要操作的元素
     * @return
     *    数组集合
     */
    function siblings(curEle) {
        return prevAll(curEle).concat(nextAll(curEle));
    }

    /*
     * index：获取当前元素的索引
     * @parameter
     *    curEle：当前需要操作的元素
     * @return
     *    元素索引(数字)
     */
    function index(curEle) {
        return prevAll(curEle).length;
    }

    /*
     * firstChild：获取容器中的第一个子元素
     * @parameter
     *   curEle：当前需要操作的元素
     * @return
     *   第一个子元素或者null
     */
    function firstChild(curEle) {
        if ('firstElementChild' in curEle) {
            return curEle.firstElementChild;
        }
        var first = curEle.firstChild;
        while (first && first.nodeType !== 1) {
            first = first.nextSibling;
        }
        return first;
    }

    /*
     * prepend：把新的元素添加到指定容器开头的位置，和原生JS中的appendChild相反，JQ中有这个方法，JQ中还有append方法：添加到容器的末尾
     * @parameter
     *   newEle：新增加的元素
     *   container：指定的容器
     */
    function prepend(newEle, container) {
        var first = firstChild(container);
        if (first) {
            container.insertBefore(newEle, first);
            return;
        }
        container.appendChild(newEle);
    }

    /*
     * insertAfter：把新元素添加到老元素的后面,JQ中有这个方法,JQ中还有一个方法insertBefore:添加到老元素的前面,等价于JS中的insertBefore
     * @parameter
     *   newEle：新增的元素
     *   oldEle：原有的元素
     */
    function insertAfter(newEle, oldEle) {
        var n = next(oldEle),
            p = oldEle.parentNode;
        if (n) {
            p.insertBefore(newEle, n);
            return;
        }
        p.appendChild(newEle);
    }

    function win(attr, val) {
        if(typeof val === 'undefined'){
            return document.documentElement[attr] || document.body[attr];
        }
        document.documentElement[attr] = val;
        document.body[attr] = val;
    }

    return {
        win: win,
        listToArray: listToArray,//->JQ没有
        offset: offset,
        css: css,
        getByClass: getByClass,//->JQ没有
        children: children,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
        prev: prev,
        prevAll: prevAll,
        next: next,
        nextAll: nextAll,
        siblings: siblings,
        index: index,
        firstChild: firstChild,
        prepend: prepend,
        insertAfter: insertAfter
    }
})();