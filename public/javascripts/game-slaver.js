
var cdom_copy = document.getElementById('drawer_copy');
var cobj_copy = cdom_copy.getContext('2d');

// init socket

var socket = io.connect(window.location.origin);
socket.emit('joinRoom', {roomid: roomid});
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

socket.on('newUserJoin', function (data) {
    
    console.log("newUserJoin message: " + JSON.stringify(data));

});

//init socket ok
