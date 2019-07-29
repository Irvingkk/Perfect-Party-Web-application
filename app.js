const express = require('express');
const path = require('path');

const pageRouter = require('./page');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', pageRouter);


// catch 404
app.use(function(req, res, next) { 
  let error = new Error("Page Not Found");
  res.status(404);
  res.render('error', {error});
})
let port = 3206
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
