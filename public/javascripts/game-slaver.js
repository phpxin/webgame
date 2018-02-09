
var cdom_copy = document.getElementById('drawer_copy');
var cobj_copy = cdom_copy.getContext('2d');

// init socket

var socket = io.connect(window.location.origin);

socket.emit('joinRoom', {roomid: roomid, username: username});

socket.on('drawSync', function (data) {
    console.log("drawSync message: " + JSON.stringify(data));
    var points = data ;

    if(points.length>1) {
        cobj_copy.beginPath();
        cobj_copy.moveTo(points[0][0], points[0][1]);
        for (var i = 1, c = points.length; i < c; i++) {
            cobj_copy.lineTo(points[i][0], points[i][1]) ;
        }
        cobj_copy.stroke();
    }
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
    appendChat("<li><span class='c-user'>系统</span>：房间已解散</li>");
    quit();
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

//退出房间
$('#chat-input #quit').click(function(){
    
    socket.emit('slaverQuit',{roomid: roomid, username:username});
    quit();
})


function quit(){
    var date=new Date();    //获取当前时间 
    date.setTime(date.getTime()-10000);    //将date设置为过去的时间
    //将userId这个cookie删除 
    document.cookie="roomid=0; expires="+date.toGMTString();
    document.cookie="username=; expires="+date.toGMTString();

    socket.close();
    window.location.href="/" ;
}