const Mysql = require('mysql') ;


const connection = Mysql.createConnection({
	host : "127.0.0.1" ,
	user : "root" ,
	password : "lixinxin" ,
	database : "drawserver" ,
	charset : 'utf8mb4_general_ci'
}) ;

connection.connect();


function sql_select(sql){

	return new Promise(function (resole, reject){
		connection.query(sql, function(err, rows, fields){
			if(err){
				resole(false) ;
			}
			
			resole(rows) ;
		}) ;
	})

}

function sql_insert(sql){

	return new Promise(function (resole, reject){
		connection.query(sql, function(err, results, fields){
			if(err){
				
				resole(0) ;
			}

			
			resole(results.insertId) ;
		}) ;
	})

}

function sql_update(sql){
	return new Promise(function (resole, reject){
		connection.query(sql, function(err, results, fields){
			if(err){
				resole(false) ;
			}
			
			resole(true) ;
		}) ;
	})

}

function close(){
	connection.end();
}

module.exports = {
	sql_select : sql_select ,
	sql_insert : sql_insert ,
	sql_update : sql_update ,
	close : close 
} ;