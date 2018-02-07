//init socket

var socket = io.connect(window.location.origin);

socket.emit('joinRoom', {roomid: roomid, username: username});

socket.on('drawSync', function (data) {
    
    console.log("drawSync message: " + JSON.stringify(data));

});

socket.on('msgSync', function (data) {
    
    var html = "<li><span class='c-user'>"+data.username+"</span>："+data.msg+"</li>";
    $("#room-chat").append(html);
    $('#room-chat-body').scrollTop(parseInt($('#room-chat').height()));

});

socket.on('newUserJoin', function (data) {
    
    //console.log("newUserJoin message: " + JSON.stringify(data));
    var html = "<li><span class='c-user'>系统</span>：欢迎"+data.username+"加入房间</li>";
    $("#room-chat").append(html);
    $('#room-chat-body').scrollTop(parseInt($('#room-chat').height()));
});

socket.on('success', function(data){
    alert("恭喜"+data.username+"猜对"+data.msg);
    window.location.href="/" ;
});

//init socket ok

$('#chat-input button').click(function(){
    let msg = $('#chat-input textarea').val();
    socket.emit('msg',{roomid: roomid, username: username, msg: msg});
    $('#chat-input textarea').val("");
})

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
