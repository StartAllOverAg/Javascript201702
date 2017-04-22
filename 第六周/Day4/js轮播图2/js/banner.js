(function () {
    // 创建一个Banner类
    function Banner(curEle, reqUrl, interTime) {
        // 获取最外层容器
        this.curEle = document.getElementById(curEle);
        // 获取操作元素
        // img的容器
        this.wrap = utils.getByClass('wrap', this.curEle)[0];
        // 获取wrap下所有img 并保存到 实例上
        this.oImgs = this.wrap.getElementsByTagName('img');
        // 焦点的容器
        this.focus = utils.getByClass('focus', this.curEle)[0];
        // 获取focus下所有 焦点
        this.focusList = this.focus.getElementsByTagName('li');

        // 左切换 右切换
        this.left = utils.getByClass('left', this.curEle)[0];
        this.right = utils.getByClass('right', this.curEle)[0];

        // 请求url
        this.reqUrl = reqUrl;
        // 轮播间隔时间
        this.interTime = interTime || 3000;
        // 记录当前图片索引
        this.step = 0;
        // 动画执行标记 true 执行动画 false 不执行动画
        this.flag = true;
        this.init();
    }

    // 获取数据
    Banner.prototype.getData = function () {
        var that = this; // 缓存下当前实例
        var xhr = new XMLHttpRequest;
        xhr.open('get', this.reqUrl, false);
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && /^2\d{2}$/.test(this.status)) {
                // 将请求到的数据 保存到当前实例
                that.data = utils.toJSON(this.responseText);
            }
        };
        xhr.send(null);
    };

    // 绑定数据
    Banner.prototype.bindData = function () {
        if (this.data && this.data.length) {
            var imgStr = '';
            var focusStr = '';
            for (var i = 0; i < this.data.length; i++) {
                var data = this.data[i];
                imgStr += '<img real=' + data.img + '>';
                focusStr += i === 0 ? '<li class="selected"></li>' : '<li></li>';
            }
            // 将图片输出到页面wrap容器中
            this.wrap.innerHTML = imgStr;
            // 将焦点输出到页面focus容器中
            this.focus.innerHTML = focusStr;
        }
        this.imgLength = this.oImgs.length;
    };

    // 图片延迟加载
    Banner.prototype.delayImg = function () {
        var that = this;
        for (var i = 0; i < that.oImgs.length; i++) {
            ~function (n) {
                var oImg = that.oImgs[n];
                var imgSrc = oImg.getAttribute('real');
                // 检测图片资源有效性
                var tempImg = new Image;
                tempImg.src = imgSrc;
                tempImg.onload = function () {
                    oImg.src = imgSrc;
                    tempImg = null;
                    if (n === 0) {
                        zfAnimate({
                            ele: oImg,
                            target: {
                                opacity: 1
                            },
                            duration: 300
                        })
                    }
                }
            }(i);
        }
    };

    // autoMove 自动轮播控制
    Banner.prototype.autoMove = function (ind) {
        var that = this;

        typeof ind != 'undefined' ? that.step = ind : that.step++;

        // 如果大于最后一张图片 索引 就让它 从0开始
        // if(that.step > that.imgLength -1)

        if (that.step === that.imgLength) {
            that.step = 0;
        }
        // 让当前要渐变的图片 z-index 为1 其他的图片 z-index 为0
        var curImg = that.oImgs[that.step];
        utils.css(curImg, 'zIndex', 1);
        var other = utils.siblings(curImg);
        for (var i = 0; i < other.length; i++) {
            utils.css(other[i], 'zIndex', 0);
        }

        // 执行渐变动画
        zfAnimate({
            ele: curImg,
            target: {
                opacity: 1
            },
            duration: 300,
            callBack: function () {
                for (var i = 0; i < other.length; i++) {
                    utils.css(other[i], 'opacity', 0);
                }
                that.flag = true;
            }
        });
        that.changeFocus(that.step);
    };

    // 绑定事件处理
    Banner.prototype.bindEvent = function () {
        var that = this;
        // 滑过/滑出   显示/隐藏 左右切换
        that.curEle.onmouseenter = function () {
            that.left.style.display = that.right.style.display = 'block';
            clearInterval(that.timer); // 清除定时器
        };

        that.curEle.onmouseleave = function () {
            that.left.style.display = that.right.style.display = 'none';
            that.timer = setInterval(function () {
                that.autoMove();
            }, that.interTime);
        };
        
        // 焦点点击事件
        for(var i = 0; i < that.focusList.length; i++){
            var curLi = that.focusList[i];
            curLi.ind = i;
            curLi.onmouseover = function () {
                that.autoMove(this.ind);
            }
        }

        // 左右切换事件
        that.left.onclick = function () {
            if(that.flag) {
                that.step--;
                if(that.step === -1) {
                    that.step = that.imgLength-1;
                }
                that.autoMove(that.step);
                that.flag = false;
            }

        };

        that.right.onclick = function () {
            if(that.flag)  {
                that.autoMove();
                that.flag = false;
            }
        };

    };

    Banner.prototype.changeFocus = function (ind) {
        var that = this;
        // 让索引 为ind的那个 焦点为选中样式 其他的移除选中样式
        for (var i = 0; i < that.focusList.length; i++) {
            var curLi = that.focusList[i];
            i === ind ? utils.addClass(curLi, 'selected') : utils.removeClass(curLi, 'selected')
        }
    };


    // 触发器 管理 调用 其他方法
    Banner.prototype.init = function () { // init this当前实例
        var that = this;
        this.getData(); // 获取数据调用
        this.bindData(); // 绑定数据调用
        this.delayImg(); // 图片延迟加载调用
        this.timer = setInterval(function () {
            that.autoMove();
        }, this.interTime);
        this.bindEvent();
    };

    // 将Banner类挂载到全局
    window.Banner = Banner;

})();
