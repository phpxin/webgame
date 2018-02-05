const Mysql = require('mysql') ;
const wgConfig = require('./config') ;


const connection = Mysql.createConnection(wgConfig.dbconf) ;

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