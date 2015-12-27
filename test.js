const credentials = {
	user: 'postgres',
	pass: 'admin',
	dbname: 'testjs'
}

const connection = require("./index.js")(credentials);

const querySet = {
	user_id: 2
};

const queryFind = {
	id: 7
}

connection.get( "child", {} )
	.then(function(rows){
		console.log( rows.rows );
	})
	.catch(function(err){
		console.log(err);
	});