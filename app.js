const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const errorHandlers = require('./errors/errorHandlers');


const app = express();


//Template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Front end files
app.use(express.static(path.join(__dirname, 'public')));

//Required express middleware to handle raw requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// START
app.use('/', routes);


// Error handling
app.use(errorHandlers.notFound);

if( app.get('env' === 'development') ) {
  app.use(errorHandlers.developmentErrors);
};

app.use(errorHandlers.productionErrors);



module.exports = app;
