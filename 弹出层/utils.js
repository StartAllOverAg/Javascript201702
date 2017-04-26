var utils = {
    createModal : function (reveal_cls,msg) {
        var default_html = '';
        if(arguments[2]){
            default_html = arguments[2];
        }
        var template_html = '<div class="reveal-modal-bg reveal-modal-bg-'+ reveal_cls +'">' +
            '<div class="reveal-modal reveal-modal-'+reveal_cls+'">' +
            '<div class="reveal-modal-header reveal-modal-header-'+ reveal_cls +'">' +
            '<h4>'+ msg +'</h4>'+
            '<span class="reveal-modal-close reveal-modal-close'+ reveal_cls +'">&#215;</span>'+
            '</div>'+
            '<div class="reveal-modal-content">' +
            default_html+
            '</div>'+
            '<div class="reveal-modal-footer">' +
            '<button class="cancel">取消</button>'+
            '<button class="sure">确定</button>'+
            '</div>'+
            '</div>'+
            '</div>';
        //创建文档碎片
        var registerModal = document.getElementsByClassName('reveal-modal-'+reveal_cls);
        if(registerModal.length === 0){
            var frg = document.createDocumentFragment();
            //创建一个div来接受这个对象
            var oDiv = document.createElement('div');
            oDiv.innerHTML= template_html;
            frg.appendChild(oDiv);
            document.body.appendChild(frg);
            frg = null;
        }else{
            document.getElementsByClassName('reveal-modal-bg-'+reveal_cls)[0].style.display = 'block';
        }
        //绑定关闭弹出层事件
        var closeBtn = document.getElementsByClassName('reveal-modal-close'+reveal_cls)[0];
        closeBtn.onclick =  function () {
            document.getElementsByClassName('reveal-modal-bg-'+ reveal_cls)[0].style.display = 'none';
        };
        var revealModal = document.getElementsByClassName('reveal-modal-'+reveal_cls)[0];
        var revealModalHeader = document.getElementsByClassName('reveal-modal-header-'+reveal_cls)[0];
        var winW = document.documentElement.clientWidth || document.body.clientWidth;
        var winH = document.documentElement.clientHeight || document.body.clientHeight;
        var revealW = revealModal.offsetWidth;
        var revealH = revealModal.offsetHeight;
        revealModal.style.left = (winW-revealW)/2 + "px";
        revealModal.style.top = (winH-revealH)/2 + "px";
        var modalDown = function (e) {
            e = window.event || e;
            //把鼠标距离窗口左边距离和上面距离，弹出层的left和top保存到this属性里面
            this["strX"] = e.clientX;
            this["strY"] = e.clientY;
            this["strL"] = parseFloat(revealModal.style.left);
            this["strT"] = parseFloat(revealModal.style.top);
            var _this = this;
            document.onmousemove = function (e) {
                modalMove.call(_this,e);
            };
            document.onmouseup = function (e) {
                modalUp.call(_this,e)
            }
        };
        var modalMove = function (e) {
            e = window.event || e;
            //把当前鼠标移动距离计算出来；
            var changeL = e.clientX -this["strX"];
            var changeT = e.clientY - this["strY"];
            var left = this["strL"] + changeL;
            var top = this["strT"] + changeT;
            var minL = 0;
            var maxL = winW - revealW;
            var minT = 0;
            var maxT = winH - revealH;
            if(left < minL ){
                left = 0;
            }else if(left >maxL){
                left = maxL;
            }
            if(top < minT){
                top = 0;
            }else if(top > maxT){
                top = maxT;
            }
            revealModal.style.left = left + "px";
            revealModal.style.top = top + "px";
        };
        var modalUp = function (e) {
            e = window.event || e;
            document.onmousemove = null;
            document.onmouseup = null;
        }
        revealModalHeader.onmousedown = modalDown;
    }
}