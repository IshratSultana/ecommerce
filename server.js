const express = require('express');
const app = express();
const adminRouters = require('./routers/admin');
const customerRouters = require('./routers/customer');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csrf = require('csurf')
const db = require('./config/database');
const flash = require('connect-flash');
const morgan = require('morgan');
const expressEJSLayouts = require('express-ejs-layouts');

var __basedir = __dirname;
// setup route middlewares
var csrfProtection = csrf({ cookie: true })
global.app__basedir = __basedir;

// parse cookies
// we need this because "cookie" is true in csrfProtection
app.use(cookieParser())
// app.use(cookieParser(serverDefinitions.server.secret));
app.use(bodyParser.urlencoded({ extended: true }))

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__basedir, 'views'));
app.use(expressEJSLayouts);
//setup public folder
app.use('/public', express.static('public'));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    next();
});

app.use(morgan('combined'))


app.use(flash());

app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    // handle CSRF token errors here
    res.status(403)
    res.send('form tampered with')
})

app.use((req, res, next) => {
    res.locals.url = req.originalUrl;
    res.locals.host = req.get('host');
    res.locals.protocol = req.protocol;

    if (Object.keys(req.cookies).length > 0 && req.cookies.constructor === Object && req.cookies.hasOwnProperty('e-comAuthenticatedUserEmail') && req.cookies.hasOwnProperty('e-comAuthenticatedUserType')) {
        db.connection.query('SELECT * FROM users WHERE email = ?', [req.cookies['e-comAuthenticatedUserEmail']], (err, result) => {
            if (err) throw err;
            console.log(result[0])
            app.locals.session = result[0]
        })
    }

    if (Object.keys(req.cookies).length > 0 && req.cookies.constructor === Object && req.cookies.hasOwnProperty('e-comAuthenticatedCustomerEmail') && req.cookies.hasOwnProperty('e-comAuthenticatedCustomerType')) {
        if (req.cookies['e-comAuthenticatedCustomerType'] === 'customer') {
            // console.log("*&&^%$#%$@!")
            db.connection.query('SELECT * FROM users WHERE email = ?', [req.cookies['e-comAuthenticatedCustomerEmail']], (err, result2) => {
                if (err) throw err
                if (result2.length > 0) {
                    app.locals.anyLoggedUser = {
                        isLoggedIn: true,
                        profileInfo: result2[0]
                    }
                } else {
                    app.locals.anyLoggedUser = {
                        isLoggedIn: false,
                        profileInfo: null
                    }
                }
            })
        }
    } else {
        app.locals.anyLoggedUser = {
            isLoggedIn: false,
            profileInfo: null
        }
    }

    next();
});

adminRouters(app, csrfProtection, __basedir);
customerRouters(app, csrfProtection, __basedir);

db.connection.connect((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("DB connected successfully.")
    }
})

app.listen(2020, function () {
    console.log("Listening on port 2020!")
});
