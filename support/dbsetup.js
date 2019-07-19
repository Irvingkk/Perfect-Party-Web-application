const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

const config = require('./dbconn.json');

const db = mysql.createConnection({
    host: config.host,
    port: config.port,
    user: 'root',
    password: '',  /* fill root password here */
    multipleStatements: true,
});

function callback(err) {
    if (err) {
        if (err.sql) {
            console.error(err.sql.substring(err.sql.indexOf('\n')));
            console.error(err.sqlState);
            console.error(err.sqlMessage);
        } else {
            console.error(err);
        }
        db.end();
        process.exit(1);
    }
}

db.connect(callback);

db.query(
    "create database ??",
    [config.database], callback);

db.query(
    "grant all privileges on ??.* to ?@'%' identified by ?",
    [config.database, config.user, config.password], callback
);

db.query(
    "grant select on performance_schema.* to ?@'%'",
    [config.user], callback
);

try { 
    schema = fs.readFileSync(path.join(__dirname, 'schema.sql'));
    db.changeUser(config, callback);
    db.query(schema.toString(), callback);
} catch (err) {
    callback(err);
}

db.end();