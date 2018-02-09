var express = require('express');
var router = express.Router();
var dboper = require('./dboper');

var keywords_collection=['黄瓜','香蕉','榴莲','苹果','柑橘','火龙果','西红柿','梨','樱桃','圣女果'] ;

//创建房间，返回房间ID
function createRoom(username){
	return new Promise(async function(resole, reject){
		let k_index = parseInt(Math.random()*1000)%keywords_collection.length ;
		var keywords = keywords_collection[k_index] ;
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
		if (!_info || _info.length<=0) {
			resole(false) ;
		}


		sql = "insert into roomuser(roomid,username) values('"+roomId+"', '"+username+"')" ;
		await dboper.sql_insert(sql);
		
		resole(_info[0]);
	}) ;
}

/* GET home page. */
router.get('/', async function(req, res, next) {
	var roomInfo = null ;
	var username = null ;

	var roomid = parseInt(req.cookies.roomid); // 如果有未完成的房间id，禁止重复创建

	if(roomid){

		var sql = "select * from room where id="+roomid ;
		var _info = await dboper.sql_select(sql) ;
		if (!_info) {
			res.redirect('/err?errmsg=房间不存在');
		}
		roomInfo = _info[0] ;
	}

	if(roomInfo==null || roomInfo.status==3){

		username = req.query.uname ;
		if(req.query.rn>0){
			//加入房间

			let counter = await dboper.sql_select("select count(*) as c from roomuser where roomid="+req.query.rn+" and username='"+username+"'") ;
			if(counter[0].c > 0){
				res.redirect('/err?errmsg=用户名重复');
			}

			roomInfo = await joinRoom(username, req.query.rn) ; 

			if (!roomInfo) {

				res.redirect('/err?errmsg=房间不存在');
			}


			if (roomInfo.status==3) {
				res.redirect('/err?errmsg=游戏已结束');
			}
		}else{
			//创建
			roomInfo = await createRoom(username);
			if (!roomInfo) {
				res.redirect('/err?errmsg=创建失败');
			}
		}
		res.cookie('roomid', roomInfo.id);
		res.cookie('username', username);
	}else{
		username = req.cookies.username;
	}

	let userAgent = req.headers['user-agent'] ;
	let device = 'pc' ;
	if (/android|ipad|iphone/i.test(userAgent)) {
		device = 'h5' ;
	}

	roomUsers = await dboper.sql_select("select * from roomuser where roomid="+roomInfo.id);

	let pageSets = { 
		title: 'Express Game' , 
		username: username , 
		roomInfo: roomInfo , 
		roomUsers: roomUsers , 
		role: role } ; 

	var role = 'slaver' ;

	if(username==roomInfo.adduser){
		role = 'master' ;
		
		if (device == 'pc') {
			res.render('gameMaster', pageSets);
		}else{
			res.render('gameMasterH5', pageSets);
		}
		
	}else{
		if (device == 'pc') {
			res.render('gameSlaver', pageSets);
		}else{
			res.render('gameSlaverH5', pageSets);
		}
	}

  	
});

module.exports = router;
