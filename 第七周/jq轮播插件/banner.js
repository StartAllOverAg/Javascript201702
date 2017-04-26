$(function() {
	function Banner(reqUrl, interTime) {

		interTime = interTime || 2000;
		// this 是当前调用Banner方法的jq对象
		// 获取操作元素
		// 1.获取最外层容器
		var $swiper = this;
		// 通过find方法查找 指定容器内 某些 后代元素
		// 查找图片容器 
		var $wrap = this.find('.oWrap');
		// 查找焦点容器
		var $focus = this.find('.focus');

		// 左右切换
		var $left = this.find('.left');
		var $right = this.find('.right');
		var imgData;
		var $imgList;
		var $focusList;

		// 记录当前轮播图片索引
		var step = 0;

		var time = null;　
		// 获取数据
		var getData = function() {
			$.ajax({
				url: reqUrl,
				type: 'get',
				dataType: 'json',
				async: false,
				success: function(result) {
					imgData = result;
				}
			});
		};

		// 绑定数据
		var bindData = function() {
			var imgStr = '';
			var focusStr = '';
			$.each(imgData, function(ind, item) {
				//				console.log(this); 当前遍历出来的每一项
				imgStr += '<img data-src=' + this.img + ' >';
				//              focusStr += '<li></li>';
				focusStr += ind === 0 ? '<li class="selected"></li>' : '<li></li>';
			});
			// 输出到页面
			$wrap.html(imgStr);
			$focus.html(focusStr);
			//			$focus.children().eq(0).addClass('selected');
			$focusList = $focus.children();
		};

		// 图片延迟加载
		var delayImg = function() {
			$imgList = $wrap.find('img');

			$imgList.each(function() {
				var imgSrc = $(this).data('src');
				// 检测图片有效性
				var tempImg = new Image;
				$(tempImg).prop('src', imgSrc);
				var $that = $(this);
				$(tempImg).load(function() {
					$that.prop('src', imgSrc);
					$that.index() === 0 ? $that.fadeIn(300) : null;
				});
			});
			$focus.show();
		};

		var autoMove = function(n) {

			$.type(n) === 'number' ? step = n : step++;

			if(step === $imgList.length) {
				step = 0;
			}
			$imgList.stop().eq(step).fadeIn(300).siblings().fadeOut(400);

			$focusList.eq(step).addClass('selected').siblings('.selected').removeClass('selected');
		};

		// 绑定事件处理
		var bindEvent = function() {
			$swiper.hover(function() {
				$left.fadeIn(200).next('a').fadeIn(200);
				clearInterval(time);
			}, function() {
				$left.fadeOut(200).next('a').fadeOut(200);
				time = setInterval(autoMove, interTime);
			});

			// 焦点点击事件

			$focusList.click(function() {
				autoMove($(this).index());
			});

			$left.click(function() {
				// 检测当前是否正则进行动画
				if($imgList.is(':animated')) return;
				step--;
				if(step === -1) {
					step = $imgList.last().index();
				}
				autoMove(step);
			});

			$right.click(function() {
				// 检测当前是否正则进行动画
				if($imgList.is(':animated')) return;
				autoMove();
			});

		};
		getData();
		bindData();
		delayImg();
		bindEvent();
		// 图片加载完后执行 自动轮播
		time = setInterval(autoMove, interTime);
	}

	// 扩展到jq原型上
	$.fn.extend({
		Banner: Banner
	});
});