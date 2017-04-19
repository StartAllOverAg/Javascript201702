function on(ele, type, handler, bool) { // 绑定事件
    // 自定义事件
    if(/^self/.test(type)){
        if(!ele['onSelf' + type]) {
            ele['onSelf' + type] = [];
        }
        var events = ele['onSelf' + type];
        for(var k = 0; k < events.length; k++){
            if(events[i] === handler) {
                return;
            }
        }
        events.push(handler);
        console.log(events);
        return;
    }

    if(ele.addEventListener){
        bool = bool || false;
        ele.addEventListener(type, handler, bool);
    } else {
        if(!ele['onEvent' + type]) { // 如果当前事件类型没有 才创建属于这个事件类型的事件池
            ele['onEvent' + type] = []; // 事件池
            // run 方法就是当前 这个事件类型的 执行者
            ele.attachEvent('on' + type, function (e) {
                e = e || window.event;
                run.call(ele,e);
            });
        }
        var events = ele['onEvent' + type];
        if(events && events.length) { // 避免往 该事件类型的事件池中重复添加handler处理函数
            for(var i = 0; i < events.length; i++) {
                if(events[i] === handler) { // 如果当前事件池中已经有了 要添加的这个handler（处理函数） 就没必要 再重复往 事件池里再添加
                    return;
                }
            }
        }
        events.push(handler); // 按照绑定顺序往对应类型的事件池中存储处理函数
//            console.log('onEvent' + type); // ele['onEventclick'] ele的click的事件池
    }
}

function off(ele, type, handler, bool) { // 移除事件
    if(ele.removeEventListener) {
        bool = bool || false;
        ele.removeEventListener(type, handler, bool);
    } else {
        var events = ele['onEvent' + type];
        if(events && events.length) {
            for(var i = 0; i < events.length; i++) {
                if(events[i] === handler){ // 在事件池 中 把我要移除的handler处理函数 从 事件池中移除 （run执行的时候 只看事件池中 有哪些处理函数 就执行哪些处理函数）
                    events.splice(i,1);
                    break;
                }
            }
        }
//             ele.detachEvent('on' + type, handler);
    }
}

// 根据 触发的事件类型 找到 相应的事件池 然后 依次取出 按顺序执行事件池中的处理函数handler
function run(e) { // 控制处理函数执行顺序
    // 事件对象兼容只需要解决 IE低版本中的兼容
    e.target = e.srcElement;
    e.preventDefault = function () {
        e.returnValue = false;
    };
    e.stopPropagation = function () {
        e.cancelBubble = true;
    };

    e.pageX = (document.documentElement.scrollLeft || document.body.scrollLeft) + e.clientX;
    e.pageY = (document.documentElement.scrollTop || document.body.scrollTop) + e.clientY;

//        this === ele 当前绑定事件的元素
//        console.log('onEvent' + e.type);
    var events = this['onEvent' + e.type]; // 如果是点击的话 我们要找的应该是click的事件池 this['onEventclick'] = click事件池
    if(events && events.length) { // events = [handler1,handler2,handler3]
        for(var i = 0; i < events.length; i++) {
            events[i].call(this,e); // 处理函数执行的时候将里面this改为当前绑定事件元素
        }
    }
}

function selfRun(ele, type,e) {
    var events = ele['onSelf' + type];
    if(events && events.length) {
        for(var i = 0; i < events.length; i++){
           events[i].call(ele, e)
        }
    }
}