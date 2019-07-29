const express = require('express');
const router = express.Router();
const db = require('./db');

// route to home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Perfect Party' });
});

// route to create_client page
router.get('/create_client', function(req, res, next){
  res.render('create_client');
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
  db.select_client().then(
    /* on success */
    (result) => {
      res.status(200);
      res.render('table',
        {
          rows: result,
          columns: ['ID', 'FirstName', 'LastName', 'Email', 'Phone', 'BillingMethod'],
          action: 'client_action'
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

// route to client edit or delete
router.get('/client/edit/:id', function (req, res, next){
    let ID = req.params.id;
    db.select_client({ID}).then(
        (result) => {
            res.status(200);
            res.render('edit_client', {_client_: result[0]});
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
    db.delete_client(client_id).then(
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



// route to create_event page(multiple pages in one web page)
router.get('/create_event', function(req, res, next) {
  db.list_venue().then(
    /* on success, render with venue list */
    (result) => {
        res.status(200);
      // res.render('create_event',
      //     {
      //     event: null,
      //     venues: result,
      //     suppliers: supplier,
      //     items: item}
      //     );
        res.render('create_event',
            {
                venues: result
            })
    },
    /* on failure, render with empty list */
    (error) => {
      console.error(error);
        res.status(400);
      res.render('create_event', {event: null, venues: []});
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



router.get('/search_client', function (req, res, next) {
    res.render('search_client');
});

// route to event searching page (show add more codes to put an event table )
router.get('/search_event', function(req, res, next) {
    db.select_event(req.body).then(
        /* on success */
        (result) => {
            res.status(200);
            res.render('search_event',
                {
                    rows: result,
                    columns: [
                        'ID', 'Subject', 'Type', 'Description', 'Budget',
                        'NumGuests', 'DesiredDate', 'Client','Location'
                    ],
                    action: 'event_action'
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

router.post('/search_event', function(req, res) {
  /**
   * req.body should look like:
   * { Subject: xxx, Type: xxx, Client: xxx, Location:xxx }
   */
  db.select_event(req.body).then(
    /* on success */
    (result) => {
      res.status(200);
      res.render('search_event',
        {
          rows: result,
          columns: [
            'ID', 'Subject', 'Type', 'Description', 'Budget',
            'NumGuests', 'DesiredDate', 'Client','Location'
          ],
          action: 'event_action'
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

/************* supplier below ****************/

router.get('/add_supplier', function (req, res, next) {
    res.render('add_supplier');
});

// insert
router.post('/add_supplier', function (req, res, next) {
    db.insert_supplier(req.body).then(
      /* on success*/
      (result) => {
          console.log(result);
          res.status(200);
          message = "Successfully create supplier";
          res.redirect('/manage_suppliers');

      },
      /* on failure, render with empty list */
      (error) => {
          console.error(error);
          res.status(400);
          res.send('Cannot create supplier.');
      }
    )
});


router.get('/manage_suppliers', function (req, res, next) {

    db.select_all_supplier().then(
            (result) => {
                res.status(200);
                res.render('manage_suppliers', { Supplier: result });
            },
        /* on failure */
        (error) => {
            console.error(error);
            res.status(500);
            res.send('Internal Error');
        }
      );

});


//query
router.post('/manage_suppliers', function (req, res, next) {
    db.select_supplier(req.body).then(
        (result) => {
            res.status(200);
            res.render('manage_suppliers', { Supplier: result });
        },
    (error) => {
        console.error(error);
        res.status(500);
        res.send('Internal Error');
    }
  );
});

// update
router.get('/edit_supplier/:ID', function (req, res, next) {
    
    supplier_id = req.params.ID;
    db.query_supplier(supplier_id, req.body).then(
    (result) => {
        console.log(result);
        res.status(200);
        res.render('edit_supplier', { Supplier: result[0] });
    },
    (error) => {
        console.error(error);
        res.status(500);
        res.send('Internal Error');
    }
    );

});

router.post('/edit_supplier/:ID', function (req, res, next) {
    db.update_supplier(req.body).then(
            (result) => {
                console.log(req.body);
                res.status(200);
                message = 'Changes saved.'
                res.redirect('/manage_suppliers');
            },
            (error) => {
                console.error(error);
                res.status(500);
                res.send('Internal Error');
            }
    );
});

//delete

router.get('/delete_supplier/:ID', function (req, res, next) {
    db.delete_supplier(req.params.ID).then(
        (result) => {
            res.status(200);
            res.redirect('/manage_suppliers');
        },
        (error) => {
            console.error(error);
            res.status(500);
            res.send('Internal Error');
        }
    );
});


// route to event edit or delete
router.get('/event/edit/:id', function (req, res, next){
    let event_id = req.params.id;
    db.list_venue()
    db.query_event(event_id).then(
        (result) => {
            res.status(200);
            res.render('create_event', {
                // events: result[0],
                // ifEdit: true,
                venues: venues
            });
        },
        (error) => {
            console.log(error);
            res.status(400);
        }
    )
});

router.post('/event/edit/:id', function (req, res, next) {
    let event_id = req.params.id;
    db.modify_event(event_id, req.body).then(
        (result) => {
            res.status(200);
            res.redirect('/search_event');
        },
        (error) => {
            console.log(error);
            res.status(400);
        }
    )
});

router.get('/event/delete/:id', function(req, res, next){
    let event_id = req.params.id;
    db.delete_event(event_id, req.body).then(
        (result) => {
            res.status(200);
            res.redirect('/search_event');
        },
        (error) => {
            console.log(error);
            res.status(400);
        }
    )
});


// route to add_item page for event
router.get('/event/:id/item', function (req,res,next) {
    let event_id = req.params.id;
    db.list_event_item(event_id).then(
        (result) => {
            res.status(200);
            res.render('search_item', {
                rows: result,
                columns: ['ID', 'Name', 'Price', 'Quantity']
            })
        },
        (error) =>{
            console.log(error);
            res.status(400);
        }
    )
});

router.get('/event/:id/item/add', function (req, res, next) {
    db.select_item(req.query).then(
        (result) => {
            res.status(200);
            let items = {};
            for (let row of result) {
                if (!items[row.Type]) items[row.Type] = [];
                items[row.Type].push(row);
            }
            res.render('select_item', {
                Menus: items['Menu'],
                Menu_col: ['ItemId', 'Cuisine', 'Calories', 'Servings'],
                Decors: items['Decor'],
                Decor_col: ['ItemId', 'Brand', 'Description', 'Image'],
                Musics: items['Music'],
                Music_col: ['ItemId', 'Artist', 'Album', 'Genre', 'Length']
            });
        }, (error) =>{
            console.log(error);
            res.status(400);
        }
    )
});

router.post('/event/:id/item/add', function (req, res, next) {
    let eventID = req.params.id;
    db.add_event_item(eventID, req.body).then(
        (result) => {
            res.status(200);
            res.redirect('/event/'+ eventID +'/item');
        }, (error) =>{
            console.log(error);
            res.status(400);
        }
    )
});



module.exports = router;

