const express = require('express');
const router = express.Router();
const db = require('./db');

// route to home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Perfect Party' });
});

// route to create_client page
router.get('/create_client', function(req, res, next){
  res.render('create_client',{response: ''});
});

router.post('/create_client', function(req, res, next){
  db.insert_client(req.body).then(
    /* on success, render with venue list */
    (result) => {
      console.log(result);
      res.status(200);
      res.render('alert', {message: `Successfully create client ID ${result.insertId}`});
    },
    /* on failure, render with empty list */
    (error) => {
      console.error(error);
      res.status(400);
      res.render('alert', {message: `Cannot create client.`});
    }
  )
});


// route to client table page
router.get('/list_client', function(req, res, next){
  db.list_client().then(
    /* on success */
    (result) => {
      res.status(200);
      res.render('list_client',
        {
          clients: result,
          columns: ['ID', 'FirstName', 'LastName', 'Email', 'Phone', 'BillingMethod'],
        }
      );
    },
    /* on failure */
    (error) => {
      console.error(error);
      res.status(500);
      res.render('alert', {message: 'Internal Error'})
    }
  );
});

// route to client edit
router.get('/client/edit/:id', function (req, res, next){
    let client_id = req.params.id;
    db.query_client(client_id).then(
        (result) => {
            res.status(200);
            res.render('edit_client', {client: result[0]});
        },
        (error) => {
            console.log(error);
            res.status(400);
        }
    )
});

router.post('/client/edit/:id', function (req, res, next) {
    let client_id = req.params.id;
    db.modify_client(client_id, req.body).then(
        (result) => {
            res.status(200);
            res.redirect('/list_client');
        },
        (error) => {
            console.log(error);
            res.status(400);
        }
    )
})

router.get('/client/delete/:id', function(req, res, next){
    let client_id = req.params.id;
    db.delete_client(client_id, req.body).then(
        (result) => {
            res.status(200);
            res.redirect('/list_client');
        },
        (error) => {
            console.log(error);
            res.status(400);
        }
    )
})




// route to add_supplier page
router.get('/add_supplier', function(req, res, next){
    res.render('create_supplier');
});


// route to create_event page(multiple pages in one web page)
router.get('/create_event', function(req, res, next) {
  db.list_venue().then(
    /* on success, render with venue list */
    (result) => {
        res.status(200);
      res.render('create_event', {venues: result});
    },
    /* on failure, render with empty list */
    (error) => {
      console.error(error);
        res.status(400);
      res.render('create_event', {venues: []});
    }
  )
});

router.post('/create_event', function(req, res, next) {
  db.insert_event(req.body).then(
    /* on success, render with venue list */
    (result) => {
      console.log(result);
      res.status(200);

      res.render('alert',{message: `Successfully create event ID ${result.insertId}`});
    },
    /* on failure, render with empty list */
    (error) => {
      console.error(error);
      res.status(400);
      res.render('alert',{message: 'Cannot create event.'});
    }
  )
});


// route to event searching page (show add more codes to put an event table )
router.get('/search_event', function(req, res, next) {
  res.render('search_event');
});

router.post('/search_event', function(req, res, next) {
  /**
   * req.body should look like:
   * { Subject: xxx, Type: xxx, Client: xxx, Location:xxx }
   */
  db.select_event(req.body).then(
    /* on success */
    (result) => {
      res.status(200);
      res.render('table', 
        {
          rows: result,
          columns: [
            'ID', 'Subject', 'Type', 'Description', 'Budget',
            'NumGuests', 'DesiredDate', 'Client','Location'
          ],
        }
      );
    },
    /* on failure */
    (error) => {
      console.error(error);
      res.status(500);
      res.send('Internal Error');
    }
  );
});



module.exports = router;
