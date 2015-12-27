const pgThen = require( 'pg-then' );


"use strict";

module.exports = function( credentials ){

	const user = credentials.user,
		pass = credentials.pass,
		dbname = credentials.dbname;

	const connString = `postgres:\/\/${user}:${pass}@localhost/${dbname}`;
	const pool = pgThen.Pool(connString);

	return {
		get: function(tableName, query){

			if (Object.keys(query).length){
				var columns = Object.keys( query );
				var whereCond = columns.map(function( value ){ return `${value} = ${query[value]}`; }).join(" AND ");
				var queryString = `SELECT * FROM ${tableName} WHERE ${whereCond};`;
			}

			else{
				var queryString = `SELECT * FROM ${tableName};`;
			}

			return pool.query(queryString);
		},
		insert: function(tableName, query){
			var columns = Object.keys( query );
			var values = columns.map(function(column){ return query[column]; });
			var columnString = columns.join(",");
			var valueString = values.map(function(value){ return `'${value}'`; }).join(",");

			var queryString = `INSERT INTO ${tableName} (${columnString}) VALUES (${valueString}) RETURNING id;`;
			return pool.query(queryString);
		},
		delete: function(tableName, query){
			if (!Object.keys(query).length){
				return new Error("Can't delete with empty query object");
			}

			var columns = Object.keys(query);
			var whereCond = columns.map(function( value ){ return `${value} = ${query[value]}`; }).join(" AND ");
			var queryString = `DELETE FROM ${tableName} WHERE ${whereCond};`;

			return pool.query(queryString);
		},
		update: function(tableName, queryFind, queryReplace){

			var findColumns = Object.keys(queryFind);
			var whereCond = findColumns.map(function( value ){ return `${value} = ${queryFind[value]}`; }).join(" AND ");

			var replaceColumns = Object.keys(queryReplace);
			var replaceValues = replaceColumns.map(function( column ){ return queryReplace[ column ]; });

			var columnString = replaceColumns.join(",");
			var valueString = replaceValues.map(function( value ){ return `'${value}'` }).join(",");

			var queryString = `UPDATE ${tableName} SET (${columnString}) = (${valueString}) WHERE ${whereCond};`;

			return pool.query(queryString);
		},

	}
}