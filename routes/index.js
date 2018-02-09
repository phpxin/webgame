var express = require('express');
var router = express.Router();
var dboper = require('./dboper');

/* GET home page. */
router.get('/', async function(req, res, next) {

	var roomid = parseInt(req.cookies.roomid); // 如果有未完成的房间id，禁止重复创建

	if(roomid){
		var sql = "select * from room where id="+roomid ;
		var _info = await dboper.sql_select(sql) ;
		if (_info) {
			let roomInfo = _info[0] ;
			if(roomInfo.status!=3){
				res.redirect('/game');
				return ;
			}
		}
		
	}

	let pageVars = { title: '登录' } ;

	let roomList = await dboper.sql_select("select * from room where status<>3 order by id desc limit 20");

	if (roomList) {

		for(let i in roomList){
			let roomUsers = await dboper.sql_select("select * from roomuser where roomid="+roomList[i].id);
			if(roomUsers){
				roomList[i].roomUsers = roomUsers ;
			}else{
				roomList[i].roomUsers = [] ;
			}
		}
		pageVars.roomList = roomList ;
	}else{
		pageVars.roomList = [] ;
	}

  	res.render('index', pageVars);
});

module.exports = router;
