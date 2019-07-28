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



async function select_all_supplier() {
    let {result, fields} = await single_query(`select * from SUPPLIER`);
    return result;
}






async function select_supplier(req_body, columns) {

    let conditions = []
    let values = []

    if (req_body) {
        for (element of ['Name', 'ContactName','ContactPhone']) {
            let val = req_body[element];
            if (req_body[element]) {
                conditions.push(` ${element} = ?`);
                values.push(val);
            }
        }

    }

    let where_clause = conditions.length > 0 ? `where ${conditions.join(' and')}` : '';
    let column_clause = columns ? columns.join(',') : '*';

    let {result, fields} = await single_query(`select ${column_clause} from SUPPLIER ${where_clause}`, values);
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

async function query_supplier(id, req_body){
    db = await connect();
    let {result} = await query(db, 'select * from SUPPLIER where ID = ?', [id]);
    return result;
}
async function insert_supplier(req_body) {

    let {result, fields} = await single_query('insert into SUPPLIER set ?', req_body);
    return result;
}

async function update_supplier(req) {

    let ID = req.params.ID;
    let Name = req.body.Name;
    let ContactName = req.body.ContactName;
    let ContactPhone = req.body.ContactPhone;

    let query = "UPDATE SUPPLIER SET Name = ?, ContactName = ?, ContactPhone = ?," +
                "where ID = ?";

    await single_query(query,[Name, ContactName, ContactPhone, ID]);
}

async function delete_supplier(id) {

    db = await connect();
    let {result} = await query(db, 'DELETE FROM SUPPLIER WHERE ID = ?', [id]);
    return result;
}


module.exports = {update_supplier, select_event, select_supplier,insert_event,
    insert_supplier,single_query,select_all_supplier, list_venue, query_supplier, delete_supplier};
