const express = require('express'); // Express
const router = express.Router(); // ROUTE Router
const jwt = require("jsonwebtoken");
const session = require('express-session'); // S Session
const { formatInTimeZone } = require('date-fns-tz');//current date and time 
const connection = require('../db/connection'); // SQL connection
const cookieParser = require('cookie-parser')
const multer = require('multer');
const path = require('path');
var http = require('http');
const fs = require('fs')
router.use(cookieParser());
var http = require('http');
const { query } = require('express');
function ref_no() {
    var minm = 1000000000;
    var maxm = 9999999999;
    var randomNumber = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
    return (randomNumber);
}
var token = ''
// SESSION  ======================================
const redirectLogin = (req, res, next) => {

    if (token == '') {
        res.redirect('/');
    }
    else {
        next();
    }
}

router.get('/', async (req, res) => {
    res.render("login.ejs")
})
///api fot authentication ///
router.post('/auth', (request, response) => {
    try {
        let user_id = request.body.user_email;
        let password = request.body.user_password;
        if (user_id && password) {
            connection.query('SELECT * FROM user_login_master WHERE user_email = ? AND password = ?', [user_id, password], function (error, results, fields) {
                if (error) throw error;
                if (results.length > 0) {
                    if (results[0].status == 'active') {
                        console.log(results[0].status, "result")
                        token = jwt.sign(
                            { user_name: results[0].user_name, user_email: results[0].user_email, status: results[0].status },
                            "jwttokenkeyforujjwalproject@fastoir",
                            { expiresIn: "1h" }
                        );
                        response.redirect('/home');

                    } else {
                        response.send("user_is_not_active");
                    }
                } else {
                    response.send("user_not_found")
                }
            });
        } else {
            response.send('Please enter Username and Password!');
            response.end();
        }
    }
    catch (error) {
        console.log(error)
        response.send('error');
    }
})

/// api to add user ///

router.post('/add_user', async (req, res) => {
    var user_name = req.body.user_name;
    var user_email = req.body.user_email;
    var user_password = req.body.user_password;
    var user_cpassword = req.body.user_cpassword;
    const cdate = new Date()
    var current_time = formatInTimeZone(cdate, 'Asia/Kolkata', 'hh:mm:ss ');
    var today = formatInTimeZone(cdate, 'Asia/Kolkata', 'yyyy-MM-dd ');

    var sql = `INSERT INTO user_login_master(user_name,user_email,password,c_password,c_date,c_time,status) VALUES ('${user_name}','${user_email}','${user_password}','${user_cpassword}','${today}','${current_time}','active')`;
    connection.query(sql, function (error, result) {
        if (error) throw error
    })

    res.json({
        success: "success"
    });

})

router.get('/home', redirectLogin, async (req, res) => {
    const decodedToken = jwt.verify(token, "jwttokenkeyforujjwalproject@fastoir");

    var sql = `Select * from user_lead_master where status = 'unclaimed'`;
    connection.query(sql, function (error, result) {
        if (error) throw error
         var sql = `Select * from user_lead_master where status = 'claimed' and user_email = '${decodedToken.user_email}'`;
        connection.query(sql, function (error, result1) {
        if (error) throw error
             res.render("home.ejs", {
                user_name: decodedToken.user_name,
                user_email: decodedToken.user_email,
                result: result,
                result1: result1
            })
        })
    })
})

router.post('/claim_user/:token_no', async (req, res) => {
    const decodedToken = jwt.verify(token, "jwttokenkeyforujjwalproject@fastoir");
    const cdate = new Date()
    var current_time = formatInTimeZone(cdate, 'Asia/Kolkata', 'hh:mm:ss ');
    var today = formatInTimeZone(cdate, 'Asia/Kolkata', 'yyyy-MM-dd ');
    var admin_id = decodedToken.user_email;
    var claimed_by = decodedToken.user_name;
    var sql = `UPDATE user_lead_master SET admin_id='${admin_id}', claimed_date='${today}',claimed_time='${current_time}',claimed_by='${claimed_by}',status='claimed' WHERE token_no = '${req.params.token_no}'`;
    connection.query(sql, function (error, result) {
        if (error) throw error

        res.redirect('/home')
    })

})

router.get('/form', async (req, res) => {
    res.render("form.ejs")
})

router.get('/thank', async (req, res) => {
    res.render("thanks.ejs")
})

router.post('/add_form', async (req, res) => {

    const cdate = new Date()
    var current_time = formatInTimeZone(cdate, 'Asia/Kolkata', 'hh:mm:ss ');
    var today = formatInTimeZone(cdate, 'Asia/Kolkata', 'yyyy-MM-dd ');
    var user_name = req.body.user_name
    var mobile_number = req.body.mobile_number
    var user_email = req.body.user_email
    var aadhar_number = req.body.aadhar_number
    var qualification = req.body.qualification
    var remarks = req.body.remarks
    var token_no = ref_no()

    var sql = `INSERT INTO user_lead_master(token_no,user_name,user_email,user_mobile,user_aadhar,user_qualification, remarks,c_date,c_time,status) VALUES ('${token_no}','${user_name}','${user_email}','${mobile_number}','${aadhar_number}','${qualification}','${remarks}','${today}','${current_time}','unclaimed')`;
    connection.query(sql, function (error, result) {
        if (error) throw error
    })
    res.redirect("/thank")
})



module.exports = router;
