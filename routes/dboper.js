const Mysql = require('mysql') ;
const wgConfig = require('./config') ;
const mylog = require('./log');
// const connection = Mysql.createConnection(wgConfig.dbconf) ;

// connection.connect(function(err) {
//   	mylog.error(JSON.stringify(err));
//   	//process.exit();
// });	

var pool  = Mysql.createPool(wgConfig.dbconf);

function sql_select(sql){

	return new Promise(function (resole, reject){

		pool.getConnection(function(err, connection){
			if(err){
				mylog.error("pool.getConnection error");
				mylog.error(err);
				return resole(false) ;
			}

			connection.query(sql, function(err, rows, fields){
				connection.release();

				if(err){
					mylog.error(err);
					mylog.error(sql);
					return resole(false) ;
				}
				
				return resole(rows) ;
			}) ;			
		})

	})

}

function sql_insert(sql){

	return new Promise(function (resole, reject){

		pool.getConnection(function(err, connection){
			if(err){
				mylog.error("pool.getConnection error");
				mylog.error(err);
				return resole(false) ;
			}

			connection.query(sql, function(err, results, fields){
				connection.release();

				if(err){
					mylog.error(err);
					mylog.error(sql);
					return resole(0) ;
					
				}

				return resole(results.insertId) ;
			}) ;			
		})
		
	})

}

function sql_update(sql){
	return new Promise(function (resole, reject){
		pool.getConnection(function(err, connection){
			if(err){
				mylog.error("pool.getConnection error");
				mylog.error(err);
				return resole(false) ;
			}

			connection.query(sql, function(err, results, fields){
				connection.release();

				if(err){
					mylog.error(err);
					mylog.error(sql);
					return resole(false) ;
				}
				
				return resole(true) ;
			}) ;			
		})

		
	})

}

function sql_delete(sql){
	return new Promise(function (resole, reject){
		pool.getConnection(function(err, connection){
			if(err){
				mylog.error("pool.getConnection error");
				mylog.error(err);
				return resole(false) ;
			}

			connection.query(sql, function(err, results, fields){
				connection.release();
				
				if(err){
					mylog.error(err);
					mylog.error(sql);
					return resole(false) ;
				}
				
				return resole(true) ;
			}) ;			
		})

		
	})	
}

function close(){
	connection.end();
}

module.exports = {
	sql_select : sql_select ,
	sql_insert : sql_insert ,
	sql_update : sql_update ,
	sql_delete : sql_delete ,
	close : close 
} ;