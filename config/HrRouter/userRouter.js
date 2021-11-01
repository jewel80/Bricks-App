module.exports = function() {}
const async = require('async')
const Op = Sequelize.Op
const bCrypt = require('bcrypt-nodejs')

function createHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function getUserList(db, callback) {
    db.user.findAll().then(rData => {
        rData.sort(function(a, b) {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        });
        callback(rData);
    })
}

function DestroyUser(db, DATA, callback) {
    db.user.destroy({
        where: {
            id: DATA
        }
    }).then(function(state, user) {
        if (state == 1) {
            callback("success")
        } else {
            callback("error")
        }
    })
}

function UpdateUser(db, DATA, callback) {
    db.user.update({
        username: DATA.data.username
    }, {
        where: {
            id: DATA.id
        }
    }).then(cB => {
        callback("success");
    }).catch(e => {
        callback('error');
    })
}

function CreateUser(db, DATA, callback) {
    var hashedPassword = createHash(DATA.password)
    db.user.create({
        name: DATA.name,
        username: DATA.username,
        email: DATA.email,
        password: hashedPassword,
    }).then(function(r) {
        callback("success")
    }).catch(function(r) {
        callback("error")
    })
}

function ChangePassword(db, DATA, callback) {
    var hashedPassword = createHash(DATA.password)
    db.user.update({
        password: hashedPassword
    }, {
        where: {
            id: DATA.id
        }
    }).then(cB => {
        callback("success");
    }).catch(e => {
        callback('error');
    })
}


function userNavigationUnselected(db, QUERY, callback) {
    var fb_arr = [0];
    db.user_navigation.findAll({
        where: {
            user: QUERY.user
        },
        attributes: ['id', 'navigation']
    }).then(rData => {
        async.each(rData, (un, cb_un) => {
            fb_arr.push(un.navigation)
            cb_un()
        }, err => {
            db.navigation.findAll({
                where: {
                    id: {
                        [Op.notIn]: fb_arr
                    },
                    parent: {
                        [Op.not]: null
                    }
                }
            }).then(rData2 => {
                callback(rData2);
            })
        });
    })
}

function CreateUserNavigation(db, DATA, callback) {
    db.user_navigation.create({
        user: DATA.user,
        navigation: DATA.navigation
    }).then(function(r) {
        callback("success")
    }).catch(function(r) {
        callback("error")
    })
}

function userNavigationSelected(db, QUERY, callback) {
    db.user_navigation.findAll({
        where: {
            user: QUERY.user
        },
        include: [{
            model: db.user,
        }, {
            model: db.navigation,
        }]
    }).then(rData => {
        callback(rData)
    })
}

function DestroyUserNavigation(db, DATA, callback) {
    db.user_navigation.destroy({
        where: {
            id: DATA
        }
    }).then(function(state, user_navigation) {
        if (state == 1) {
            callback("success");

        } else {
            callback("error")
        }
    })
}

function UpdateUserNavigationRole(db, DATA, callback) {
    db.user_navigation.update({
        role: DATA.role
    }, {
        where: {
            id: DATA.id
        }
    }).then(cB => {
        callback("success");
    }).catch(e => {
        callback('error');
    })
}

function routerInit(app, dbFull) {
    var db = dbFull.HR_DB

    app.get('/getUserList', function(req, res) {
        getUserList(db, function(d) {
            res.setHeader('Content-Type', 'application/json')
            res.send(d)
        })
    })

    app.get('/userNavigationUnselected/:user', function(req, res) {
        userNavigationUnselected(db, req.params, function(d) {
            res.setHeader('Content-Type', 'application/json')
            res.send(d)
        })
    })

    app.get('/userNavigationSelected/:user', function(req, res) {
        userNavigationSelected(db, req.params, function(d) {
            res.setHeader('Content-Type', 'application/json')
            res.send(d)
        })
    })
}

function socketInit(dbFull, socket) {
    var db = dbFull.HR_DB

    socket.on('DestroyUser', function(data) {
        DestroyUser(db, data, function(r) {
            socket.emit("DestroyUserSMS", r)
        })
    })

    socket.on('UpdateUser', function(data) {
        UpdateUser(db, data, function(r) {
            socket.emit("UpdateUserSMS", r)
        })
    })

    socket.on('CreateUser', function(data) {
        CreateUser(db, data, function(r) {
            socket.emit("CreateUserSMS", r)
        })
    })

    socket.on('CreateUserNavigation', function(data) {
        CreateUserNavigation(db, data, function(r) {
            socket.emit("CreateUserNavigationSMS", r)
        })
    })

    socket.on('DestroyUserNavigation', function(data) {
        DestroyUserNavigation(db, data, function(r) {
            socket.emit("DestroyUserNavigationSMS", r)
        })
    })

    socket.on('UpdateUserNavigationRole', function(data) {
        UpdateUserNavigationRole(db, data, function(r) {
            socket.emit("UpdateUserNavigationRoleSMS", r)
        })
    })

    socket.on('ChangePassword', function(data) {
        ChangePassword(db, data, function(r) {
            socket.emit("ChangePasswordSMS", r)
        })
    })
}

module.exports.routerInit = routerInit;
module.exports.socketInit = socketInit;