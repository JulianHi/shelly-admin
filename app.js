/* eslint-disable lodash/import-scope */
/* eslint-disable lodash/matches-prop-shorthand */
/* eslint-env node */
/* eslint no-unused-vars: ["error", { "args": "none" }]*/
/* eslint-disable lodash/prefer-lodash-method */
//const lodash = require('lodash');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const express = require('express');
const SSE = require('express-sse');
const morgan = require('morgan');
const shellycoap = require('./shelly-coap.js')

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const app = express();
const sse = new SSE();

app.locals.shellylist = shellycoap(sse);
//app.locals._ = lodash;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Add handler for client to be able to request no compression. This is required for express-sse
app.use(compression({
  filter: function (req, res) {
    return (req.headers['x-no-compression']) ? false : compression.filter(req, res);
  }
}));
app.use('/', indexRouter);
app.use('/api', apiRouter);
app.get('/events', sse.init);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
