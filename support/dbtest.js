const mysql = require('mysql');
const config = require('./dbconn.json');

const db = mysql.createConnection(config);

function printError(err) {
    if (err.sql) {
        console.error(err.sql.substring(err.sql.indexOf('\n')));
        console.error(err.sqlState);
        console.error(err.sqlMessage);
    } else {
        console.error(err);
    }
}

function isGranted(results, fields) {

    if (fields.length == 1) {
        let col = fields[0].name;
        let pattern = new RegExp(`ALL PRIVILEGES ON .${config.database}.\\.\\*`);
        for (row of results) {
            console.log(row[col]);
            if (pattern.test(row[col])) return true;
        }
    }

    return false;
}

db.connect(function (err) {
    if (err){
        printError(err);
        process.exit(1);
    }
});

db.query(
    "show grants",
    function (err, results, fields) {
        if (err) {
            printError(err);
            db.end();
            process.exit(1);
            return;
        }

        if (!isGranted(results, fields)) {
            console.log('CHECK');
            db.end();
            process.exit(1);
            return;
        }
        console.log('OK');
    }
)

db.end();