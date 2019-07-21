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

async function select_event(req_body, columns) {
  /**
   * req_body should look like:
   * { Subject: xxx, Type: xxx, Client: xxx, Location:xxx }
   * colums should look like:
   * [ 'Subject', 'ID', ...]
   */
  let conditions = []
  let values = []

  if (req_body) {
    for (element of ['Type', 'Client', 'Location']) {
      let val = req_body[element];
      if (req_body[element]) {
        conditions.push(` ${element} = ?`);
        values.push(val);
      }
    }

    for (element of ['Subject']) {
      let val = req_body[element];
      if (req_body[element]) {
        conditions.push(` ${element} like ?`);
        values.push(`%${val}%`);
      }
    }
  }

  let where_clause = conditions.length > 0 ? `where ${conditions.join(' and')}` : '';
  let column_clause = columns ? columns.join(',') : '*';

  let {result, fields} = await single_query(`select ${column_clause} from EVENT ${where_clause}`, values);
  return result;
}

async function list_venue() {
  let {result, fields} = await single_query(`select ID,Address from VENUE`);
  return result;
}

async function insert_event(req_body) {
  /**
   * req_body should look like:
   * {
   *   Subject: xxx, Budget: xxx, NumGuests: xxx,
   *   DesiredDate:xxx, Description:xxx, Location:xxx
   * }
   */
  let {result, fields} = await single_query('insert into EVENT set ?', req_body);
  return result;
}

module.exports = {select_event, insert_event, list_venue};
