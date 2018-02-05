//init socket

var socket = io.connect(window.location.origin);

socket.emit('joinRoom', {roomid: roomid});

socket.on('drawSync', function (data) {
    
    console.log("drawSync message: " + JSON.stringify(data));

});

socket.on('newUserJoin', function (data) {
    
    console.log("newUserJoin message: " + JSON.stringify(data));

});

//init socket ok


var cdom = document.getElementById('drawer');
var cobj = cdom.getContext('2d');//获取一个canvas的2d上下文

// var cdom_copy = document.getElementById('drawer_copy');
// var cobj_copy = cdom_copy.getContext('2d');

var m_x = 0;
var m_y = 0;
var flag_draw = false;

var senddata = [];
var _senddata = [];

cdom.onmousedown = function(event){
    console.log(event)

    flag_draw = true;
    m_x = event.offsetX;
    m_y = event.offsetY;

    cobj.beginPath();
    cobj.moveTo(m_x, m_y);

    addData(m_x, m_y);
    _addData(m_x, m_y);
}

cdom.addEventListener('touchstart', function(event) {
    // 如果这个元素的位置内只有一个手指的话
    if (event.changedTouches.length == 1) {
        event.preventDefault();// 阻止浏览器默认事件，重要 
        var touch = event.changedTouches[0];

        flag_draw = true;
        m_x = touch.clientX;
        m_y = touch.clientY;

        cobj.beginPath();
        cobj.moveTo(m_x, m_y);

        addData(m_x, m_y);
        _addData(m_x, m_y);
    }
}, false);  

cdom.onmousemove = function(event){
    if(flag_draw){
        var v_m_x = event.offsetX ;
        var v_m_y = event.offsetY ;

        cobj.lineTo(v_m_x,v_m_y) ;
        cobj.stroke();

        if(Math.abs(m_x-v_m_x)>5 && Math.abs(m_y-v_m_y)>5){
            m_x = v_m_x;
            m_y = v_m_y;
            addData(v_m_x, v_m_y);
        }
        _addData(v_m_x, v_m_y);
    }
}

cdom.addEventListener('touchmove', function(event) {
    // 如果这个元素的位置内只有一个手指的话
    if (event.changedTouches.length == 1) {
        event.preventDefault();// 阻止浏览器默认事件，重要 
        var touch = event.changedTouches[0];

        if(flag_draw){
            var v_m_x = touch.clientX;
            var v_m_y = touch.clientY ;

            cobj.lineTo(v_m_x,v_m_y) ;
            cobj.stroke();

            if(Math.abs(m_x-v_m_x)>5 && Math.abs(m_y-v_m_y)>5){
                m_x = v_m_x;
                m_y = v_m_y;
                addData(v_m_x, v_m_y);
            }
            _addData(v_m_x, v_m_y);
        }
    }
}, false);  

cdom.onmouseup = function(event){
    flag_draw = false;

    var v_m_x = event.offsetX ;
    var v_m_y = event.offsetY ;

    addData(v_m_x, v_m_y);
    _addData(v_m_x, v_m_y);
    senddata_do();
}

cdom.addEventListener('touchend', function(event) {
    // 如果这个元素的位置内只有一个手指的话
    if (event.changedTouches.length == 1) {
        event.preventDefault();// 阻止浏览器默认事件，重要 
        var touch = event.changedTouches[0];

        flag_draw = false;

        var v_m_x = touch.clientX ;
        var v_m_y = touch.clientY ;

        addData(v_m_x, v_m_y);
        _addData(v_m_x, v_m_y);
        senddata_do();
    }
}, false); 

function senddata_do(){
    var _debug = JSON.stringify(senddata);
    console.log(_debug);

    
    socket.emit('draw', {'roomid':roomid, 'points':senddata});
    // send data end

    senddata = [];

    var _debug2 = JSON.stringify(_senddata);
    console.log(_debug2);
    _senddata = [] ;
}

function addData(x, y){
    senddata.push([parseInt(x),parseInt(y)]) ;
}

function _addData(x,y){
    _senddata.push([x,y]) ;
}
