const fs = require('fs')
const config = require('./config')

function writeLog(content, level){
	let date = new Date();
	let savepath = config.logpath+"/"+date.getFullYear()+"-"+date.getMonth()+".log" ;
	let now = date.toLocaleString();
	let v_content = now + "\t" + level + "\t" + content + "\n" ;

	fs.appendFile(savepath, v_content, function(err){
		if(err)
			console.log(err);
	});
}

function error(content){
	writeLog(content, "error") ;
}

module.exports = {
	error : error ,
}