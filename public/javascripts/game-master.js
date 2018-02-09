//init socket

// init socket
showLogMsg('正在连接到服务器...');
var socket = io.connect(window.location.origin);

socket.on('connect', function(){
    showLogMsg('连接成功');
    socket.emit('joinRoom', {roomid: roomid, username: username});
})
socket.on('connect_error', function(error){
    showLogMsg('连接失败，请刷新页面：'+JSON.stringify(error));
})
socket.on('connect_timeout', function(timeout){
    showLogMsg("连接超时："+timeout);
})
socket.on('error', function(error){
    showLogMsg("连接出错，请刷新页面："+JSON.stringify(error));
})
socket.on('disconnect', function(reason){
    showLogMsg("连接已断开："+reason);
})
socket.on('reconnect', function(attemptNumber){
    showLogMsg('重新连接成功');
    socket.emit('joinRoom', {roomid: roomid, username: username});
})
socket.on('reconnect_attempt', function(attemptNumber){
    showLogMsg("重连尝试中 ... attempt "+attemptNumber);
})
socket.on('reconnecting', function(attemptNumber){
    showLogMsg("重连尝试中 ... attempt "+attemptNumber);
})
socket.on('reconnect_error', function(error){
    showLogMsg('重连错误，请刷新页面：'+JSON.stringify(error));
})
socket.on('reconnect_failed', function(){
    showLogMsg('重连失败，请刷新页面');
})
// socket.on('ping', function(){
//     logMsg("connect ping ");
// })
// socket.on('pong', function(latency){
//     logMsg("connect pong "+latency);
// })

socket.on('drawSync', function (data) {
    
    console.log("drawSync message: " + JSON.stringify(data));

});

socket.on('msgSync', function (data) {
    
    appendChat("<li><span class='c-user'>"+data.username+"</span>："+data.msg+"</li>");

});

socket.on('newUserJoin', function (data) {
    
    appendChat("<li><span class='c-user'>系统</span>：欢迎"+data.username+"加入房间</li>");

    var ele = $(".ru-item") ;
    
    for(let i=0; i<ele.length; i++){
        let _html = ele.eq(i).html();
        if(_html == data.username){
            return true;
        }
    }

    $('#room-users').append('<span class="ru-item">'+data.username+'</span>');
    return true;
});

socket.on('masterQuitSync', function(data){
    
    alert("解散房间完成");

    var date=new Date();    //获取当前时间 
    date.setTime(date.getTime()-10000);    //将date设置为过去的时间
    //将userId这个cookie删除 
    document.cookie="roomid=0; expires="+date.toGMTString();
    document.cookie="username=; expires="+date.toGMTString();

    socket.close();

    window.location.href="/" ;
})

socket.on('slaverQuitSync', function(data){
    appendChat("<li><span class='c-user'>系统</span>："+data.username+"退出房间</li>"); 
    var ele = $(".ru-item") ;
    
    for(let i=0; i<ele.length; i++){
        let _html = ele.eq(i).html();
        if(_html == data.username){
            ele.eq(i).remove();
        }
    }
})

socket.on('success', function(data){
    alert("恭喜"+data.username+"猜对"+data.msg);
    window.location.href="/" ;
});

//init socket ok

$('#chat-input #send').click(function(){
    let msg = $('#chat-input textarea').val();
    socket.emit('msg',{roomid: roomid, username: username, msg: msg});
    $('#chat-input textarea').val("");
})

//群主解散房间
$('#chat-input #quit').click(function(){
    
    socket.emit('masterQuit',{roomid: roomid});
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

function showLogMsg(msg){
    var html = "<li><span class='c-user'>系统</span>："+msg+"</li>";
    $("#room-chat").append(html);
    $('#room-chat-body').scrollTop(parseInt($('#room-chat').height()));
}