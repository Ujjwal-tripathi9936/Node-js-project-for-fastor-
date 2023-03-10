const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const mainRoute = require('./routes/route');
const app = express();
const con=require('./db/connection');
const session = require('express-session');


app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb', parameterLimit: 50000}));
app.use(cookieParser());

app.use('/static', express.static("public"));

app.use('/', mainRoute);
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.listen(process.env.PORT |5000, ()=> {
    console.log("Server is running on 5000 port");
});