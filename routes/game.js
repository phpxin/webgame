var express = require('express');
var router = express.Router();
var dboper = require('./dboper');

//创建房间，返回房间ID
function createRoom(username){
	return new Promise(async function(resole, reject){
		var keywords = '黄瓜' ;
		var status = 1 ; //等待玩家加入
		var sql = "insert into room(keywords,status,adduser) values('"+keywords+"', '"+status+"', '"+username+"')" ;
		var insertid = await dboper.sql_insert(sql);
		
		if(insertid==0){
			
			resole(false);
		}
		
		sql = "insert into roomuser(roomid,username) values('"+insertid+"', '"+username+"')" ;
		await dboper.sql_insert(sql);

		resole({'id':insertid, 'keywords':keywords, 'status':status, 'adduser': username}) ;
	});
}

function joinRoom(username, roomId){
	return new Promise(async function(resole, reject){
		var sql = "select * from room where id="+roomId+' limit 1' ;
		var _info = await dboper.sql_select(sql) ;
		if (!_info) {
			resole(false) ;
		}

		resole(_info[0]);
	}) ;
}

/* GET home page. */
router.get('/', async function(req, res, next) {
	var roomInfo = null ;
	var username = null ;

	var roomid = req.cookies.roomid; // 如果有未完成的房间id，禁止重复创建
	

	if(roomid){
		var sql = "select * from room where id="+roomid ;
		var _info = await dboper.sql_select(sql) ;
		roomInfo = _info[0] ;
	}

	if(roomInfo==null || roomInfo.status==3){
		username = req.query.uname ;
		if(req.query.rn>0){
			//加入房间
			//coding...
			roomInfo = await joinRoom(username, req.query.rn) ; 
			if (!roomInfo) {
				res.location('/err');
			}
		}else{
			//创建
			roomInfo = await createRoom(username);
			if (!roomInfo) {
				res.location('/err');
			}
		}
		res.cookie('roomid', roomInfo.id);
		res.cookie('username', username);
	}else{
		username = req.cookies.username;
	}

	var role = 'slaver' ;
	if(username==roomInfo.adduser){
		role = 'master' ;
		res.render('gameMaster', { title: 'Express Game' ,username: username, roomInfo: roomInfo, role: role });
	}else{
		res.render('gameSlaver', { title: 'Express Game' ,username: username, roomInfo: roomInfo, role: role });
	}

  	
});

module.exports = router;
