const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Perfect Party' });
});

router.get('/create_event', function(req, res, next) {
  db.list_venue().then(
    /* on success, render with venue list */
    (result) => {
      res.render('create_event', {venues: result});
    },
    /* on failure, render with empty list */
    (error) => {
      console.error(error);
      res.render('create_event', {venues: []});
    }
  )
});

router.get('/add_client', function(req, res, next){
    res.render('create_client');
});
router.get('/add_supplier', function(req, res, next){
    res.render('create_supplier');
});

router.post('/create_event', function(req, res, next) {
  db.insert_event(req.body).then(
    /* on success, render with venue list */
    (result) => {
      console.log(result);
      res.status(200);
      res.send(`Successfully create event ID ${result.insertId}`);
    },
    /* on failure, render with empty list */
    (error) => {
      console.error(error);
      res.status(400);
      res.send('Cannot create event.');
    }
  )
});

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
