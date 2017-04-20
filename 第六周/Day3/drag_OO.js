function Drag(curEle) {
    this.ele = curEle;
    this.DOWN = this.handlerThis(this.down, this);
    on(this.ele, 'mousedown', this.DOWN);
}
Drag.prototype.down = function (e) {
    this.ele.l = e.clientX - this.ele.offsetLeft;
    this.ele.t = e.clientY - this.ele.offsetTop;

    var winW = document.documentElement.clientWidth || document.body.clientWidth;
    var winH = document.documentElement.clientHeight || document.body.clientHeight;
    this.ele.maxL = winW - this.ele.offsetWidth;
    this.ele.maxT = winH - this.ele.offsetHeight;

    this.ele.MOVE = this.handlerThis(this.move, this);
    this.ele.UP = this.handlerThis(this.up, this.ele);
    on(document, 'mousemove', this.ele.MOVE);
    on(document, 'mouseup', this.ele.UP);
};

Drag.prototype.move = function (e) {
    e.preventDefault();
    this.ele.boxL = e.clientX - this.ele.l;
    this.ele.boxT = e.clientY - this.ele.t;
    this.computed.call(this.ele);
};

Drag.prototype.up = function () {
    off(document, 'mousemove', this.MOVE);
    off(document, 'mouseup', this.UP);
};

Drag.prototype.computed = function () {
    if (this.boxL > this.maxL) {
        this.boxL = this.maxL;
    } else if (this.boxL <= 0) {
        this.boxL = 0;
    }
    if (this.boxT > this.maxT) {
        this.boxT = this.maxT;
    } else if (this.boxT <= 0) {
        this.boxT = 0;
    }
    this.style.left = this.boxL + 'px';
    this.style.top = this.boxT + 'px';
};

Drag.prototype.handlerThis = function (fn, context) {
    return function (e) {
        fn.call(context, e);
    }
};
