const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mysql = require('mysql');
const config = require('./dbconn.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let db = mysql.createConnection({});

function connect() { return new Promise((resolve, reject) => {
  db.connect((err) => {
    if (err) reject(err);
    else resolve();
  })
})}
  
function execute(sql, values) { return new Promise((resolve, reject) => {
  db.query(sql, values, (err) => {
    if (err) reject(err);
    else resolve();
  })
})}

function changeUser(user) { return new Promise((resolve, reject) => {
  db.changeUser(user, (err) => {
      if (err) reject(err);
      else resolve();
    });
})}

function executeFile(file) {
  return (new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, file), (err, data) => {
      if (err) reject(err);
      else resolve(data.toString());
    });
  })).then(execute, (_)=>_);
}

function readPassword() { return new Promise((resolve, reject) => {
  let _ =  rl._writeToOutput;

  rl.question('Password: ', function(password) {
    rl._writeToOutput = _;
    resolve(password);
  })

  rl._writeToOutput =  function (stringToWrite) {
    rl.output.write('*');
  }
})}

function readUsername() { return new Promise((resolve, reject) => {
  rl.question('Username: ', function(user) {
    resolve(user);
  })
})}

(async function (){
  try {
    let user = await readUsername();
    let password = await readPassword();
    db = mysql.createConnection({
      host: config.host,
      port: config.port,
      socketPath: config.socketPath,
      user, password,
      multipleStatements: true,
    })
    await connect();
    await execute("drop database if exists ??", [config.database]);
    await execute("create database ??", [config.database]);
    await execute("grant all privileges on ??.* to ?@'%' identified by ?", [config.database, config.user,config.password]);
    await execute("grant select on performance_schema.* to ?@'%'", [config.user]);
    await changeUser(config);
    await executeFile('schema.sql');
    await executeFile('sample.sql');
  } catch(err) {
    console.error(err);
  }
  db.end();
  process.exit(0);
})();
