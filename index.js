"use strict";

const pgThen = require( 'pg-then' );

const operations = {

	init: function(credentials){
		const user = credentials.user,
			pass = credentials.pass,
			dbname = credentials.dbname;

		const connString = `postgres:\/\/${user}:${pass}@localhost/${dbname}`;
		this.pool = pgThen.Pool(connString);
	},

	create: function(tableName, query){
		let queryString;

		if (query instanceof Array){
			//expects all objects to have the same columns
			const columns = Object.keys( query[0] );

			const valuesStringList = [];

			query.forEach(function(single){
				let values = columns.map(function(column){ return `'${single[column]}'`; });
				let valuesString = values.join(",");
				valuesStringList.push(values);
			});

			const columnString = columns.join(",");
			const allValuesString = valuesStringList.map(function(valuesString){ return `(${valuesString})` }).join(",");

			queryString = `INSERT INTO ${tableName} (${columnString}) VALUES ${allValuesString} RETURNING id;`
		}

		else{
			const columns = Object.keys( query );
			const values = columns.map(function(column){ return query[column]; });
			const columnString = columns.join(",");
			const valuesString = values.map(function(value){ return `'${value}'`; }).join(",");

			queryString = `INSERT INTO ${tableName} (${columnString}) VALUES (${valuesString}) RETURNING id;`;
		}

		return this.pool.query(queryString).then(function(raw){
			return Promise.resolve(raw.rows);
		});
	},

	read: function(tableName, query){
		let queryString;

		if (query instanceof Array){
			const columns = Object.keys( query[0] );
			const whereCondList = [];

			query.forEach(function(single){
				let whereCond = columns.map(function( value ){ return `${value} = '${single[value]}'`; }).join(" AND ");
				whereCondList.push( whereCond );
			});

			const allWhereCond = whereCondList.join(" OR ");
			queryString = `SELECT * FROM ${tableName} WHERE ${allWhereCond};`;
		}

		else{
			if (Object.keys(query).length){
				const columns = Object.keys( query );
				const whereCond = columns.map(function( value ){ return `${value} = '${query[value]}'`; }).join(" AND ");
				queryString = `SELECT * FROM ${tableName} WHERE ${whereCond};`;
			}

			else{
				queryString = `SELECT * FROM ${tableName};`;
			}
		}

		return this.pool.query(queryString).then(function(raw){
			return Promise.resolve(raw.rows);
		});
	},

	update: function(tableName, queryFind, queryReplace){

		const findColumns = Object.keys(queryFind);
		const whereCond = findColumns.map(function( value ){ return `${value} = ${queryFind[value]}`; }).join(" AND ");

		const replaceColumns = Object.keys(queryReplace);
		const replaceValues = replaceColumns.map(function( column ){ return queryReplace[ column ]; });

		const columnString = replaceColumns.join(",");
		const valueString = replaceValues.map(function( value ){ return `'${value}'` }).join(",");

		const queryString = `UPDATE ${tableName} SET (${columnString}) = (${valueString}) WHERE ${whereCond};`;

		return this.pool.query(queryString);
	},

	destroy: function(tableName, query){
		if (!Object.keys(query).length){
			return new Error("Can't delete with empty query object");
		}

		let queryString;

		if (query instanceof Array){
			const columns = Object.keys( query[0] );
			const whereCondList = [];

			query.forEach(function(single){
				let whereCond = columns.map(function( value ){ return `${value} = '${single[value]}'`; }).join(" AND ");
				whereCondList.push( whereCond );
			});

			const allWhereCond = whereCondList.join(" OR ");
			queryString = `DELETE FROM ${tableName} WHERE ${allWhereCond};`;
		}

		else{
			const columns = Object.keys(query);
			const whereCond = columns.map(function( value ){ return `${value} = ${query[value]}`; }).join(" AND ");
			queryString = `DELETE FROM ${tableName} WHERE ${whereCond};`;
		}

		return this.pool.query(queryString).then(function(raw){
			return Promise.resolve(raw.rowCount);
		});
	}
};

module.exports = exports = operations;