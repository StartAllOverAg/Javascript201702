(function () {
    // 获取操作元素
    // 可视区域容器
    var outer = document.getElementById('outer');
    var wid = outer.clientWidth;

    // 图片外层 平移容器
    var swiper = document.getElementById('swiper');
    // 获取swiper下所有图片
    var oImgs = swiper.getElementsByTagName('img');
    // 焦点容器
    var focus = document.getElementById('focus');
    // 获取焦点
    var oLis = focus.getElementsByTagName('li');
    // 获取左右切换
    var oLeft = document.getElementById('oLeft');
    var oRight = document.getElementById('oRight');

    // 获取数据
    function getData(callBack) {
        var xhr = new XMLHttpRequest;
        xhr.open('get', 'data.txt', true);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && /^2\d{2}$/.test(this.status)) {
                var data = utils.toJSON(this.responseText);
                typeof callBack === "function" ? callBack(data) : null;
            }
        };
        xhr.send(null);
    }

    getData(bindData); // 将bindData 作为一个回调函数放到getData里 当接收到数据后让bindData 在里面执行 并且把请求到的数据传递到bindData里
    var length;
    function bindData(data) {
        // 总共图片个数（包含重复的最后一张）
        length = data.length + 1;
        // 动态设置 swiper 的宽度
        utils.css(swiper, 'width', length * wid);
        // 拼接图片
        var imgSrc = '';
        // 拼接焦点
        var focusSrc = '';
        // 拼接数据
        for (var i = 0; i < data.length; i++) {
            var cur = data[i];
            imgSrc += '<div><img real=' + cur.img + '></div>';
            // 如果是第一个li 让它有 选中样式
            focusSrc += i === 0 ? '<li class="selected"></li>' : '<li></li>';
        }
        // 拼接和第一张一模一样的图片 作为最后一张
        imgSrc += '<div><img real=' + data[0].img + '></div>';
        // 输出拼接好的 图片
        swiper.innerHTML = imgSrc;
        // 输出拼接好的 焦点
        focus.innerHTML = focusSrc;
        // 图片延迟加载
        delayImg();
        // 拼接完焦点后 给焦点循环绑定事件
        bindEvent();
    }

    // 图片延迟加载
    // var timer;
    function delayImg() {
        for (var i = 0; i < oImgs.length; i++) {
            (function (n) {
                var oImg = oImgs[n]; // 当前图片
                // 获取到当前img保存的要加载的图片地址
                var imgSrc = oImg.getAttribute('real');
                // 检测图片资源有效性
                var tempImg = new Image;
                tempImg.src = imgSrc;
                // tempImg加载成功 触发 onload
                tempImg.onload = function () {
                    oImg.src = imgSrc;
                    zfAnimate({
                        ele: oImg,
                        target: {
                            opacity: 1
                        },
                        duration: 200
                    });
                    tempImg = null;
                }
            })(i)
        }
        // 图片加载完后执行自动轮播
        // 每3000毫秒 平移一次 让autoMove执行一次
        swiper.timer = setInterval(autoMove, 3000);
    }

    var step = 0; // 记录当前图片索引
    // 自动轮播  就是用来 根据 当前索引 平移到相应的图片位置 执行一次就平移一次
    function autoMove(ind) {
        step++;
        // 如果点击时 传了 索引 那么就让step 等于 传进来的索引
        // 让step这个平移索引 按照 点击时 传进来的索引 偏移到相应图片位置
        typeof ind != "undefined" ? step = ind : null;
        if (step > length - 1) { // 如果大于最后一张索引
            // 瞬间 平移到和最后一张 一样的第一张图片
            utils.css(swiper, 'left', 0);
            // 紧接着 让动画 从第二张开始
            step = 1;
        }
        // 执行动画
        zfAnimate({
            ele: swiper,
            target: {
                left: step * -wid
            },
            duration: 300
        });
        // 执行完动画时 让相应焦点为选中样式
        // 每次执行动画时 将当前图片索引传递 进去 让相应索引的 li 焦点 为选中样式
        changeFocus(step);
    }

    // 焦点同步
    function changeFocus(n) {
        n >= length - 1 ? n = 0 : null;
        // 让索引为n的那个li有选中样式 其他的 移除选中样式
        for (var i = 0; i < oLis.length; i++) {
            var cur = oLis[i];
            i === n ? utils.addClass(cur, 'selected') : utils.removeClass(cur, 'selected');
        }
    }

    // 给焦点绑定点击事件
    function bindEvent() {
        for (var i = 0; i < oLis.length; i++) {
            oLis[i].ind = i;
            // 点击一次 平移到相应索引图片位置一次
            oLis[i].onclick = function () {
                autoMove(this.ind);
            }
        }
    }

    // 滑入 结束动画
    outer.onmouseover = function () {
        // 滑入显示左右切换
        oLeft.style.display = oRight.style.display = 'block';
        clearInterval(swiper.timer);
    };
    // 滑出 执行新动画
    outer.onmouseout = function () {
        // 滑出隐藏左右切换
        oLeft.style.display = oRight.style.display = 'none';
        swiper.timer = setInterval(autoMove, 3000);
    };
    // 但我点击 左边时 让step-- 应为 左边按钮平移 和 自动轮播以及 右边按钮是相反方向平移（step++）
    oLeft.onclick = function () {
        step--;
        if (step === -1) {
            // 当到达第一张时 在点击左切换 时 就瞬间平移到 和第一张一模一样的 最后一张图片
            utils.css(swiper, 'left', (length - 1) * -wid);
            // 此时 紧接着  让动画 从倒数第二张 开始
            step = length - 2;
        }
        autoMove(step);
    };
    // 右切换
    oRight.onclick = function () {
        // 点击一次 平移一次 让autoMove执行一次
        autoMove();
    }
})();