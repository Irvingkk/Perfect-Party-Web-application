const express = require('express');
const path = require('path');

const pageRouter = require('./page');
const dbRouter = require('./db');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', pageRouter);
app.use('/db', dbRouter);

// catch 404
app.use(function(req, res, next) { 
  res.status(404);
  res.render('error');
})

app.listen(3000, () => console.log(`Example app listening on port ${3000}!`))
