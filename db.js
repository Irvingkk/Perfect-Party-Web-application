const express = require('express');
const router = express.Router();

const mysql = require('mysql');
const conn = require('./support/dbconn.json');

function connect() { return new Promise((resolve, reject) => {
  let db = mysql.createConnection(conn);
  db.connect((err) => {
    if (err) {
      reject(err);
    } else {
      resolve(db);
    }
  })
})}

function query(db, sql, values) { return new Promise((resolve, reject) => {
  db.query(sql, values, (err, result, fields) => {
    if (err) {
      reject(err);
    } else {
      resolve({result, fields});
    }
  })
})}

async function single_query(sql, values) {
  let db = await connect();
  try {
    let _ = await query(db, sql, values);
    db.end();
    return _;
  } catch (err) {
    db.end();
    throw err;
  }
}

router.post('/event', function(req, res, next) {
  /**
   * body should look like:
   * { Topic: xxx, Type: xxx, Client: xxx, Location:xxx }
   */
  let {Topic, Type, Client, Location} = req.body;

  let sql = 'select * from EVENT where';
  let conditions = []
  let values = []

  for (element of ['Type', 'Client', 'Location']) {
    val = req.body[element];
    if (req.body[element]) {
      conditions.push(` ${element} = ?`);
      values.push(val);
    }
  }

  for (element of ['Topic']) {
    val = req.body[element];
    if (req.body[element]) {
      conditions.push(` ${element} like ?`);
      values.push(`%${val}%`);
    }
  }

  single_query(
    `select * from EVENT ${conditions.length>0? 'where' : ''} ${conditions.join(' and')}`, values
  ).then(
    /* on success */
    ({result, fields}) => {
      res.status(200);
      res.send(JSON.stringify(result));
    },
    /* on failure */
    (err) => {
      console.error(err);
      res.status(500);
      res.send('Internal Error');
    }
  );
});

module.exports = router;
