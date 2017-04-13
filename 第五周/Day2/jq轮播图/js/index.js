$(function () {
    // 获取操作元素
    var $outer = $('#outer');
    var outer = $outer[0];
    var $wrap = $('#wrap');
    var $focus = $('#focus');
    var $focusList;
    var $oImgs;

    function getData(callBack) {
        // var that = this
        $.ajax({
            url: './data.json', // 请求的url地址
            type: 'GET', // 请求方式（POST）
            // data:{},
            // dataType: 'json', // 不需要使用$.parseJSON()
            // async: true, 异步
            success: function (result) { // 请求成功后执行
                // console.log(this);
                // console.log(result);  // 请求的本身就是json文件 默认返回的就是 json对象
                typeof callBack === 'function' ? callBack(result) : null;
            }
            // context: this // 改变回调函数中算出success的this
        });
    }

    // 执行ajax请求数据
    getData(bindData); // 将bindData当做参数传到 getData里 请求到数据成功 在里面调用执行
    // 绑定数据
    function bindData(data) {
        var imgStr = ''; // 拼接img HTML字符串
        var foucsStr = ''; // 拼接焦点 HTML字符串
        $.each(data, function () {
            imgStr += '<img data-src= ' + this.img + '>'; // $ele.data('src')
            foucsStr += '<li></li>';
        });
        // 输出到页面
        $wrap.html(imgStr);
        $focus.html(foucsStr);
        // 获取所有焦点
        $focusList = $('#focus li');
        // 让第一个焦点 为选中样式
        $focusList.eq(0).addClass('selected');
        // 获取所有图片
        $oImgs = $('#wrap img');
        delayImg(); // 图片延迟加载
    }

    // 图片延迟加载
    function delayImg() {
        var tempImg;
        $oImgs.each(function () {
            // 获取当前img 保存的图片数据
            var imgSrc = $(this).data('src');
            var $that = $(this); // 当前要加载的每一个img
            // 检测图片资源有效性
            tempImg = new Image;
            $(tempImg).prop('src', imgSrc); // ele.setAttribute('src', imgSrc)
            $(tempImg).load(function () {
                // console.log(this);// load 里面this 指向当前绑定事件的 tempImg
                // 只让第一张 渐变 index()不写参数 获取的是当前元素 在同辈元素中的索引位置
                $that.index() === 0 ? $that.fadeIn(300) : null;
                $that.prop('src', imgSrc);
                tempImg = null;
            });
        });
        // 记录当前图片索引
        outer.step = 0;
        // 焦点点击事件绑定
        bindSelectEvent();

        // 控制自动轮播的定时器
        outer.timer = setInterval(autoMove, 2000);
        // 保存最后一张索引
        outer.lastInd = $oImgs.last().index();
    }

    // 轮播方法
    function autoMove(n) {
        // 如果n传递值 就 让 outer.step = n 否则 照常 outer.step++
        !isNaN(n) ? outer.step = n : outer.step++;
        outer.step > outer.lastInd ? outer.step = 0 : null;
        // 图片渐变控制
        $oImgs.stop().eq(outer.step).fadeIn(300).siblings().fadeOut();
        // 焦点同步控制
        $focusList.eq(outer.step).addClass('selected').siblings().removeClass('selected');
    }

    $outer.hover(function () { // 滑入 清除动画
        // 控制左右切换显示
        // $('#outer a').show();
        $(this).children('a').show();
        clearInterval(outer.timer);
    }, function () {  // 滑出 开始动画
        // 控制左右切换隐藏
        // $('#outer a').hide();
        $(this).children('a').hide();
        outer.timer = setInterval(autoMove, 2000);
    });

    function bindSelectEvent() {
        // 焦点滑过事件
        $focusList.each(function () { // 给每个焦点绑定点击事件
            $(this).mouseover(function () {
                autoMove($(this).index()); // 执行autoMove时将 当前焦点索引传递进去
            });
        });

        // 左右切换事件
        $('.oLeft').click(function () {
            outer.step --;
            // 如果索引减减为负数 就让它 从最后一张开始渐变
            outer.step === -1 ? outer.step = outer.lastInd : null;
            // 然后把处理后的索引 传递给autoMove 让索引为outer.step的图片渐变
            autoMove(outer.step);
        });
        // 左右切换事件
        $('.oRight').click(function () {
             autoMove();
        });
    }

});
