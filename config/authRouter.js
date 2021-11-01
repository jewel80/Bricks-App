const fs = require('fs');
const async = require('async');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bCrypt = require('bcrypt-nodejs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function addExtJsFront(callback) {
    walk('app', function(err, files) {
        if (err) throw err;
        var script = '\n';
        async.eachSeries(files, function(file, cb) {
            script = script + '<script type="text/javascript" src="' + file.replace("app", "/js") + '"></script>\n';
            cb();
        }, function(err) {
            if (err) {
                throw err;
            }
            callback({
                extjs_app_scripts: script
            })
        })
    })
}

function walk(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    })
                } else {
                    results.push(file)
                    next()
                }
            })
        })()
    })
}

function authRouter(app, dbFull, io) {
    var db = dbFull.HR_DB

    var isAuthenticated = function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/logout');
    }

    var createHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

    var isValidPassword = function(user, password) {
        return bCrypt.compareSync(password, user.password);
    }

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        db.user.findOne({
            where: {
                id: user.id,
            }
        }).then(uData => {
            if (uData) {
                return done(null, uData);
            }
            done(null, false);
        });
    });

    passport.use('local', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, username, password, done) {
            db.user.findOne({
                where: {
                    [Op.or]: {
                        username: username,
                        email: username
                    }
                }
            }).then(user => {
                if (user == null) {
                    return done(null, false, {
                        message: 'Incorrect credentials.'
                    })
                } else if (isValidPassword(user, password)) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Incorrect credentials.'
                    })
                }
            }).catch(e => {
                return done(null, false, {
                    message: 'Incorrect credentials.'
                })
            })
        }
    ));

    app.get('/', isAuthenticated, function(req, res) {
        addExtJsFront(function(r) {
            res.render('index.ejs', {
                title: "সান ব্রিকস",
                loginUserId: req.user.id,
                loginUserName: req.user.username,
                extjs_app_scripts: r.extjs_app_scripts
            });
            io.on('connection', function(s) {
                s.on('disconnect', function() {
                    db.user.findOne({
                        where: {
                            id: req.user.id
                        }
                    }).then(function(user) {
                        user.update({
                            is_online: true,
                            last_login: new Date()
                        }).then(s => {

                        }).catch(e => {

                        })
                    }).catch(e => {

                    })
                });
            })
        })
    });

    app.get('/login', function(req, res) {
        res.render('login.ejs', {
            title: 'Sun Bricks Ltd.',
            message: req.flash('loginMessage')
        });
    });

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    // app.get('/logout', function(req, res) {
    //     req.session.destroy(function(err) {
    //         req.logout();
    //         res.redirect('/login');
    //     });
    // });

    app.get('/logout', function(req, res) {
        if (req.user) {
            db.user.update({
                is_online: false,
                last_logout: new Date()
            }, {
                where: {
                    id: req.user.id
                }
            }).then(cB => {
                req.session.cookie.expires = new Date();
                req.session.passport = {};
                req.session.destroy(function(err) {
                    req.logout();
                    res.redirect('/login'); //Inside a callback… bulletproof!
                });
            }).catch(e => {
                req.session.cookie.expires = new Date();
                req.session.passport = {};
                req.session.destroy(function(err) {
                    req.logout();
                    res.redirect('/login'); //Inside a callback… bulletproof!
                });
            })
        } else {
            req.session.cookie.expires = new Date();
            req.session.passport = {};
            req.session.destroy(function(err) {
                req.logout();
                res.redirect('/login'); //Inside a callback… bulletproof!
            });
        }
    });
}


module.exports.authRouter = authRouter;