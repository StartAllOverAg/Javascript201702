function down(e) {
    this.l = e.clientX - this.offsetLeft;
    this.t = e.clientY - this.offsetTop;

    var winW = document.documentElement.clientWidth || document.body.clientWidth;
    var winH = document.documentElement.clientHeight || document.body.clientHeight;
    this.maxL = winW - this.offsetWidth;
    this.maxT = winH - this.offsetHeight;
    this.MOVE = handlerThis(move,this);
    this.UP = handlerThis(up,this);
    on(document, 'mousemove', this.MOVE);
    on(document, 'mouseup', this.UP);
}

function move(e) {
    this.boxL = e.clientX - this.l;
    this.boxT = e.clientY - this.t;
    computed.call(this);
}

function up() {
    off(document,'mousemove',this.MOVE);
    off(document,'mouseup',this.UP);
}
// 边界判断 位置处理
function computed() {
    if(this.boxL>this.maxL){
        this.boxL = this.maxL;
    }else if(this.boxL <= 0){
        this.boxL = 0;
    }
    if(this.boxT>this.maxT){
        this.boxT = this.maxT;
    }else if(this.boxT <= 0){
        this.boxT = 0;
    }
    this.style.left = this.boxL + 'px';
    this.style.top = this.boxT + 'px';
}

// 处理this
function handlerThis(fn, context) {
    return function (e) {
        fn.call(context,e);
    }
}