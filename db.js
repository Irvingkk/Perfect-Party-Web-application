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

function generate_conditions(body, pattern){
  let conditions = [];
  let values = [];

  if (body) {
    for (let element of pattern.exact_num || []) {
      let val = Number(body[element]);
      if (!isNaN(val)) {
        conditions.push(`${element} = ?`);
        values.push(val);
      }
    }

    for (let element of pattern.range_num || []) {
      let from_str = body[`${element}From`];
      let to_str = body[`${element}To`];
      let from_val = Number(from_str);
      let to_val = Number(to_str);
      if (!isNaN(from_val) && !isNaN(to_val) && from_str && to_str) {
        conditions.push(`${element} >= ?`, `${element} <= ?`);
        values.push(from_val, to_val);
      }
    }
  
    for (let element of pattern.exact || []) {
      let val = body[element];
      if (val) {
        conditions.push(`${element} = ?`);
        values.push(`${val}`);
      }
    }

    for (let element of pattern.partial || []) {
      let val = body[element];
      if (body[element]) {
        conditions.push(`${element} like ?`);
        values.push(`%${val}%`);
      }
    }
  }

  return {conditions, values};
}


function to_where_clause(conditions) {
  return conditions.length > 0 ? `where ${conditions.join(' and ')}` : '';
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






async function select_supplier(req_body, columns) {

    let pattern = {
      partial: ['Name', 'ContactName'],
      exact: ['ContactPhone']
    }
    let {conditions, values} = generate_conditions(req_body, pattern)

    let column_clause = columns ? columns.join(',') : '*';

    let {result, fields} = await single_query(
      `select ${column_clause} from SUPPLIER ${to_where_clause(conditions)}`, values);
    return result;
}


async function insert_supplier(req_body) {
    let {result, fields} = await single_query('insert into SUPPLIER set ?', req_body);
    return result;
}

async function modify_supplier(req) {

    let Name = req.params.ID;
    let ContactName = req.body.ContactName;
    let ContactPhone = req.body.ContactPhone;

    let query = "UPDATE SUPPLIER SET ContactName = ?, ContactPhone = ?" +
                "where Name = ?";

    await single_query(query,[ContactName, ContactPhone, Name]);
}

async function delete_supplier(id) {
    let {result} = await single_query(db, 'DELETE FROM SUPPLIER WHERE ID = ?', [id]);
    return result;
}




async function select_event(req_body, columns) {
  /**
   * req_body should look like:
   * { Subject: xxx, Type: xxx, Client: xxx, Location:xxx }
   * colums should look like:
   * [ 'Subject', 'ID', ...]
   */
  let pattern = {
    exact_num : ['ID'],
    exact : ['Type', 'Client', 'Location'],
    partial : ['Subject'],
  }
  let {conditions, values} = generate_conditions(req_body, pattern)

  let column_clause = columns ? columns.join(',') : '*';

  let {result, fields} = await single_query(
    `select ${column_clause} from EVENT ${to_where_clause(conditions)}`, values);

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

async function delete_event(id){
  let {result} = await single_query("delete from EVENT where ID = ?", [id]);
  return result;
}

async function modify_event(id, req_body){
  // for (let field of 
  //   ['Subject', 'Type', 'Description', 'Budget', 'NumGuests', 'DesiredDate', 'Client', Location]
  // ){}
  let {result} = await single_query("update EVENT set ? where ID = ?", [req_body, id]);

  return result;
}




async function insert_client(req_body) {
  let db = await connect();

  let client_id = await generate_client_id(db, req_body);

  let client = {...req_body, ID: client_id};

  let {result} = await query(db, 'insert into CLIENT set ?', [client]);

  result.insertId = client_id;

  return result;
}

async function select_client(req_body) {
  let pattern = {
    exact : ['ID'],
  }
  let {conditions, values} = generate_conditions(req_body, pattern)

  let {result} = await single_query(`select * from CLIENT ${to_where_clause(conditions)}`, values);

  return result;
}

async function modify_client(id, req_body){

  // let firstName = req_body.FirstName;
  // let lastName = req_body.LastName;
  // let email = req_body.Email;
  // let phone = req_body.Phone;
  // let billingMethod = req_body.BillingMethod;

  let {result} = await single_query("update `CLIENT` set ? where ID = ?", [req_body, id]);

  return result;
}

async function delete_client(id){
  let db = await connect();

  let {result} = await query(db, "delete from CLIENT where ID = ?", [id]);
  return result;
}

async function list_venue() {
  let {result, fields} = await single_query(`select ID,Address,Capacity,Price from VENUE`);
  return result;
}




const item_type_table = {
  "Menu" : "MENUITEM",
  "Decor" : "DECORITEM",
  "Music" : "MUSICOPTION",
};

const item_type_colums = {
  "Menu" : ["Cuisine", "Calories", "Servings"],
  "Decor" : ["Brand", "Description", "Image"],
  "Music" : ["Artist", "Album", "Genre", "Length"]
}

const item_type_pattern = {
  "Menu" : { partial: ["Cuisine"], range_num: ["Calories", "Servings"] },
  "Decor" : { partial: ["Brand", "Description"] },
  "Music" : { partial: ["Artist", "Album", "Genre"], range_num: ["Length"]}
}




async function modify_event_item(event_id, usage) {
  /**
   * usage is an object {id1: quantity1, id2:quantity2, ...}
   */
  let replace_clauses = [];
  let replace_values = [];
  let delete_cond = [];
  let delete_values = [];

  Object.keys(usage).forEach((item_id)=>{
    let quantity = parseInt(usage[item_id]);
    if (quantity > 0) {
      replace_clauses.push(' (?, ?, ?)');
      replace_values.push(parseInt(event_id), Number(item_id), parseInt(usage[item_id]));
    } else {
      delete_cond.push('ItemId = ?');
      delete_values.push(Number(item_id));
    }
  });

  if (replace_clauses.length > 0) {
    let {result} = await single_query(
      `replace into USES (EventId, ItemId, Quantity) values ${replace_clauses.join(',')}`, replace_values);
  }

  if (delete_cond.length > 0) {
    let {result} = await single_query(
        `delete from USES where EventId = ? and (${delete_cond.join(' or ')})`, [event_id, ...delete_values]);
  }
}

async function list_event_item(event_id) {
  let {result} = await single_query(
    `select ID, Name, Quantity, Price from ITEM, USES where ID = ItemId and EventId = ?`, [Number(event_id)]);
  
  return result;
}

async function select_item(req_body) {

  let from_clause = "from";
  let column_clause = "";
  let cond = [], val = [];

  {
    let pattern = {
      exact_num: ['ID'],
      partial: ['Name'],
      range_num: ['Price']
    }
    let {conditions, values} = generate_conditions(req_body, pattern);

    cond.push(...conditions);
    val.push(...values);

    from_clause += ' ITEM';
    column_clause = " ITEM.ID as ID, ITEM.Name as Name, ITEM.Price as Price";
  }

  {
    let type_case = Object.keys(item_type_table).map((Type)=>
        `when ID in (select ItemId from ${item_type_table[Type]}) then '${Type}'`
    );
    column_clause += `, case ${type_case.join(' ')} end as Type`
  }
  
  Object.keys(item_type_table).forEach((type)=>{
    let table = item_type_table[type];
    let columns = item_type_colums[type];
    let pattern = item_type_pattern[type];

    if (!table || !pattern || !columns) return;

    let {conditions, values} = generate_conditions(req_body, pattern);

    cond.push(...conditions);
    val.push(...values);
  
    from_clause += ` left join ${table} on ITEM.ID = ${table}.ItemId`;
    column_clause += `, ${columns.map((c)=>`${table}.${c} as ${c}`).join(', ')}`;
  })

  if (req_body && req_body.Type) {
    cond.push('Type = ?');
    val.push(`${req_body.Type}`);
  }

  console.log(`select ${column_clause} ${from_clause} ${to_where_clause(cond)}`)
  let {result} = await single_query(
    `select ${column_clause} ${from_clause} ${to_where_clause(cond)}`, val);
  
  return result;
}



module.exports = {
  select_client, insert_client, modify_client, delete_client,
  select_event, insert_event, modify_event, delete_event,
  select_supplier, insert_supplier, modify_supplier, delete_supplier,
  list_venue,
  modify_event_item, list_event_item,
  select_item,
  };
























