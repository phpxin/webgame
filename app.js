var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var game = require('./routes/game');
var dboper = require('./routes/dboper') ;

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3001);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/game', game);
app.use('/err',function(req, res, next){

  let viewParams = {} ;
  viewParams.errmsg = req.query.errmsg ? req.query.errmsg : '出错了' ;
  viewParams.url = req.query.url ? req.query.url : '/' ;

  res.render('err', viewParams);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(require('cookie-parser')());


io.on('connection', function (socket) {

  socket.on('disconnect', function(reason){
    console.log('socket disconnect : '+reason);
  })

  socket.on('error', (error) => {
    // ...
    console.log('socket error : '+JSON.stringify(error));
  });

  socket.on('disconnecting', function(reason){
    console.log('socket disconnecting : '+reason);
  })

  socket.on('joinRoom', function(data){
    let roomStr = 'room_'+data.roomid;
    socket.join(roomStr, () => {
      //let rooms = Objects.keys(socket.rooms);
      //console.log(JSON.stringify(socket.rooms)); // [ <socket.id>, 'room 237' ]
      //console.log(JSON.stringify(data))
      io.to(roomStr).emit('newUserJoin', {username: data.username}); // broadcast to everyone in the room
    });

  })
  
  socket.on('draw', function (data) {
    
    let roomStr = 'room_'+data.roomid;
    let points = data.points;
    console.log(data);
    //socket.emit('drawSync', data); // 响应数据
    //socket.broadcast.emit('drawSync', data); // 广播
    io.to(roomStr).emit('drawSync', points);
  });

  socket.on('msg', async function (data) {

    console.log("room ids "+JSON.stringify(socket.rooms));

    let roomStr = 'room_'+data.roomid;
    let msg = data.msg ;
    let username = data.username ;

    io.to(roomStr).emit('msgSync', {username: username, msg: msg});

    let roomInfo = await dboper.sql_select("select * from room where id="+data.roomid);
    roomInfo = roomInfo[0] ;

    if(roomInfo['adduser']!=username && msg==roomInfo['keywords']){
      io.to(roomStr).emit('success', {username: username, msg: msg});
      await dboper.sql_update("update room set status=3,winner='"+username+"'");
    }

  }) ;

  socket.on('masterQuit', async function(data){

    //let 
    let roomStr = 'room_'+data.roomid;   
    io.to(roomStr).emit('masterQuitSync'); // broadcast to everyone in the room

    await dboper.sql_update("update room set status=3 where id="+data.roomid);
  })

  socket.on('slaverQuit', async function(data){

    //let 
    let roomStr = 'room_'+data.roomid;   
    io.to(roomStr).emit('slaverQuitSync', {username: data.username}); // broadcast to everyone in the room

    await dboper.sql_delete("delete from roomuser where roomid="+data.roomid+" and username='"+data.username+"'");
  })

});

process.on('uncaughtException', function (err) {
  //do something like log error
  console.log(err) ;
});

module.exports = app;
