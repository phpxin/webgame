
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
