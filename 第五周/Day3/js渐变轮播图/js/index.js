(function () {
    var outer = document.getElementById('outer');
    var wrap = document.getElementById('wrap');
    var oImgs = wrap.getElementsByTagName('img');
    var focus = document.getElementById('focus');
    var oLis = focus.getElementsByTagName('li');
    var left = outer.getElementsByTagName('a')[0];
    var right = outer.getElementsByTagName('a')[1];
    outer.step = 0; // 记录当前索引
    outer.flag = true;  // 标识动画是否结束 true 动画结束 false 动画没有结束
    //step 1 :ajax获取数据
    function getData(callBack) {
        var xhr = new XMLHttpRequest;
        xhr.open('get', './data.json', true);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && /^2\d{2}$/.test(this.status)) {
                var data = JSON.parse(xhr.responseText);
                typeof callBack === 'function' ? callBack(data) : null;
            }
        };
        xhr.send(null);
    }

    getData(bindData);

    // step 2: 绑定数据
    function bindData(data) {
        var imgStr = '';
        var focusStr = '';
        for (var i = 0; i < data.length; i++) {
            var cur = data[i];
            imgStr += '<img data-real=' + cur.img + '>';
            focusStr += i === 0 ? '<li class="selected"></li>' : '<li></li>'
        }
        wrap.innerHTML = imgStr;
        focus.innerHTML = focusStr;
        delayImg();
        bindEent();
    }

    // step 3: 图片延迟加载
    function delayImg() {
        for (var i = 0; i < oImgs.length; i++) {
            ~function (n) {
                var imgSrc = oImgs[n].getAttribute('data-real');
                var tempImg = new Image;
                tempImg.src = imgSrc;
                tempImg.onload = function () {
                    oImgs[n].src = imgSrc;
                    if (n === 0) {
                        zfAnimate({
                            ele: oImgs[0],
                            target: {
                                opacity: 1
                            },
                            duration: 300
                        })
                    }

                }
            }(i);
        }
        //调用 自动轮播
        outer.timer = setInterval(autoMove, 3000);
    }

//自动轮播

    function autoMove(n) {
        if(!outer.flag){ // 当前动画结束后才会进行 下一个动画
            return;
        }
        //当给n传值了，就执行焦点点击事件，否则就outer.step++ 自动轮播
        typeof n !== 'undefined' ? outer.step = n : outer.step++;
        // 记录当前索引
        //如果当前图片索引大于最后一张索引，就让索引为0的那张图片开始渐变
        if (outer.step > oImgs.length - 1) {
            outer.step = 0;
        }
        ///////////////////////////////////////////
        // 1.渐变前
        // 让当前这张图片 zIndex 为 1

        utils.css(oImgs[outer.step], 'zIndex', 1);
        // other 当前图片 所有兄弟img（其他的图片）
        var other = utils.siblings(oImgs[outer.step]);
        for (var i = 0; i < other.length; i++) {   // 让其他图片 zIndex 为 0
            utils.css(other[i], 'zIndex', 0);
        }
        // 渐变时
        //当前图片opacity由0过渡到1 实现渐变效果
        zfAnimate({
            ele: oImgs[outer.step],
            target: {
                opacity: 1
            },
            duration: 300,
            //动画结束后，让其他图片的透明度为0
            callBack: function () {
                for (var i = 0; i < other.length; i++) {
                    utils.css(other[i], 'opacity', 0);
                }
                outer.flag = true; // 执行完一次动画后 为true 标识当前动画是否结束
            }
        });
        // 焦点同步 把当前图片的索引 传递到 焦点同步方法里 然后让焦点中索引为 outer.step 为选中样式
        changeFocus(outer.step)
    }

    //焦点同步
    function changeFocus(ind) {
        for (var i = 0; i < oLis.length; i++) {
            var cur = oLis[i];
            i === ind ? utils.addClass(cur, 'selected') : utils.removeClass(cur, 'selected');
        }
    }

    // 滑入滑出
    outer.onmouseover = function () {
        left.style.display=right.style.display='block';
        clearInterval(outer.timer);
    };
    outer.onmouseout = function () {
        left.style.display=right.style.display='none';
        outer.timer = setInterval(autoMove, 3000);
    };

    // 事件绑定
    function bindEent() {
        // 焦点点击
        //每点击li就执行一次autoMove
        for (var i = 0; i < oLis.length; i++) {
            //把当前图片的索引给保存起来
            oLis[i].ind = i;
            var cur = oLis[i];
            cur.onmouseover = function () {
                autoMove(this.ind);
                outer.flag = false;
            }
        }
        //左右切换
        var length = oImgs.length;
        left.onclick = function () {
            //点击左侧按钮时，图片索引值对应减减
            outer.step--;
            //当图片轮播到第一张时，让图片从最后一张在开始轮播
            if (outer.step === -1) {
                outer.step = length - 1;
            }
            autoMove(outer.step);
            outer.flag = false;
        };
        //点击右侧按钮，轮播图片
        right.onclick = function () {
            autoMove();
            outer.flag = false;
        }
    }
})();