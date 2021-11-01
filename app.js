const express = require('express');
const cors = require('cors');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const Sequelize = require('sequelize');
const multer = require('multer');
process.env.TZ = 'UTC'
const app = express()

app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(cors())
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded())
app.use('/extjs', express.static(__dirname + '/extjs'))
app.use('/js', express.static(__dirname + '/app'))
app.use('/style', express.static(__dirname + '/public/style'))
app.use('/public', express.static(__dirname + '/public'))
app.use('/views', express.static(__dirname + '/views'))

app.use(session({
    secret: 'ThisIsAVeryLongSecret', // session secret
    cookie: {
        maxAge: 18000000
    }
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash()); // use connect-flash for flash messages stored in session

// /////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////

const myLogFunc = function(msg, a) {
    // console.log(msg)
}

function connect(db) {
    const dbName = db;
    const dbUser = 'sa';
    const dbPass = 'Admin@123';
    const sequelize = new Sequelize(dbName, dbUser, dbPass, {
        // host: 'DESKTOP-J3J13CA',
        host: 'DESKTOP-1L6A1AM',
        dialect: 'mssql',
        timezone: '+06:00',
        drive: 'tedious',
        port: '1433',
        dialectOptions: {
            options: {
                instanceName: 'MSSQLSERVER2012'
            },
            typeCast: function(field, next) {
                if (field.type == 'DATETIME' || field.type == 'TIMESTAMP') {
                    return new Date(field.string() + 'Z');
                }
                return next();
            },
            encrypt: false,
            useUTC: false, //for reading from database
            dateStrings: true,
            typeCast: function(field, next) { // for reading from database
                if (field.type === 'DATETIME') {
                    return field.string()
                }
                return next()
            },
            pool: {
                max: 5,
                min: 0,
                idle: 10000,
            },
        },
        // requestTimeOut: 30000,
        logging: false,
        operatorsAliases: false
    });

    sequelize.authenticate().then(function(err) {
        if (!err) {
            console.log(dbName + ' connection has been established successfully.')
        } else {
            console.log('Unable to connect to the database: ' + dbName, err)
        }
    })
    return sequelize;
}

const db = {};
db.HR_DB = require(__dirname + '/config/database/hr_db.js');
db.HR_DB.init(connect('Sun_Bricks'));

// /////////////////////////////////////////////////////////////////////////////////

const server = app.listen(8000)
    // const server = app.listen(process.env.PORT);

const io = require('socket.io').listen(server)

// /////////////////////////////////////////////////////////////////////////////////

require(__dirname + '/config/authRouter.js').authRouter(app, db, io)
require(__dirname + '/config/mainRouter.js').mainRouter(app, db, io)

// /////////////////////////////////////////////////////////////////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});