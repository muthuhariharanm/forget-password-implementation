const mysql = require("mysql");
const connection = mysql.createConnection({
	host: "db-url",
	user: "db-user",
	password: "db-pass",
	database: "db-schema",
	port: db-port
});
connection.connect(function (err) {
	if (!err) console.log("Database is connected");
	else console.log(err);
});

let createtable = `create table if not exists students(
	email varchar(255) not null,
	pass varchar(255) not null,
	PRIMARY KEY ( email )
)`;

connection.query(createtable, function (error, results, fields) {
	if (error) throw error;
	console.log('table-created-successfully');
})
module.exports = connection;

