var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var game = require('./routes/game');

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
  res.render('err');
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

  socket.on('joinRoom', function(data){
    let roomStr = 'room_'+data.roomid;
    socket.join(roomStr, () => {
      //let rooms = Objects.keys(socket.rooms);
      //console.log(JSON.stringify(socket.rooms)); // [ <socket.id>, 'room 237' ]
      io.to(roomStr).emit('newUserJoin', 'a new user has joined the room'); // broadcast to everyone in the room
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
});

module.exports = app;
