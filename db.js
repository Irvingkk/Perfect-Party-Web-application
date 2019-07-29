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
  let {result, fields} = await single_query(`select ID,Address,Capacity,Price from VENUE`);
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

async function check_client_id(db, id) {
  let {result} = await query(db, 'select ID from CLIENT where ID = ?', [id]);
  return result.length == 0;
}

async function generate_client_id(db, req_body) {

  if (req_body.Email) {
    let pattern = /^([a-zA-Z_][a-zA-Z0-9_.-]*)@.*$/;
    let match = `${req_body.Email}`.match(pattern);
    if (match) {
      let id = match[1].substr(0,8);
      if (await check_client_id(db, id)) {
        return id;
      }
    }
  }

  let numbers = [];
  for (let i=0; i < 10; i++) {
    numbers.push(Math.round(Math.random()*256));
  }

  if (req_body.FirstName && req_body.LastName) {
    let first = `${req_body.FirstName}`;
    let last = `${req_body.LastName}`;

    for (let m of ['','.','-','_'].concat(numbers)) {
      for (let i = 1; i <= first.length; i++) {
        let id = `${first.substr(0,i)}${m}${last}`;
        if (id.length > 8) break;
        if (await check_client_id(db, id)) return id;
      }
    }
  }

  if (req_body.LastName) {
    let last = `${req_body.LastName}`;
    for (let m of numbers) {
      let id = `${last}${m}`.substr(0,8);
      if (await check_client_id(db, id)) return id;
    }
  }

  throw new Error('ID generation failed.');
}

async function insert_client(req_body) {
  let db = await connect();

  let client_id = await generate_client_id(db, req_body);

  let client = {...req_body, ID: client_id};

  let {result} = await query(db, 'insert into CLIENT set ?', [client]);

  result.insertId = client_id;

  return result;
}

async function list_client() {
  let {result, fields} = await single_query(`select * from CLIENT`);
  return result;
}

async function query_client(id) {
  let db = await connect();
  let {result} = await query(db, 'select * from CLIENT where ID = ?', [id]);
  return result;
}

async function modify_client(id, req_body){
  let db = await connect();


  let firstName = req_body.FirstName;
  let lastName = req_body.LastName;
  let email = req_body.Email;
  let phone = req_body.Phone;
  let billingMethod = req_body.BillingMethod;

  let {result} = await query(db, "update `CLIENT` set `FirstName` = '" + firstName + "', `LastName` = '" +
      lastName + "', `Email` = '" + email + "', `Phone` = '" + phone + "', `BillingMethod` = '" + billingMethod + "' WHERE `ID` = '" + id + "'");

  return result;
}

async function delete_client(id){
  let db = await connect();

  let {result} = await query(db, "delete from CLIENT where ID = ?", [id]);
  return result;
}



async function query_event(id) {
  let db = await connect();
  let {result} = await query(db, 'select * from EVENT where ID = ?', [id]);
  return result;
}

async function modify_event(id, req_body){
  let db = await connect();


  let subject = req_body.Subject;
  let type = req_body.Type;
  let description = req_body.Description;
  let budget = req_body.Budget;
  let numGuests = req_body.NumGuests;
  let desiredDate = req_body.DesiredDate;
  let client = req_body.Client;
  // let location = req_body.;

  let {result} = await query(db, "update EVENT set Subject = '" + subject + "', `Type` = '" +
      type + "', Description = '" + description + "', Budget = '" + budget + "', NumGuests = '" + numGuests +
      "'DesiredDate = '" + desiredDate + "'Client'" + client + "' WHERE ID = '" + id);

  return result;
}

async function delete_event(id, req_body){
  let db = await connect();

  let {result} = await query(db, "delete from EVENT where ID = ?", [id]);
  return result;
}




module.exports = {list_client, insert_client, select_event, insert_event, list_venue, query_client, modify_client, delete_client,
query_event, modify_event, delete_event};
























