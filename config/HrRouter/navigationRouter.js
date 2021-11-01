module.exports = function() {};
const async = require('async')
const Op = Sequelize.Op

function getNavigationList(db, callback) {
    db.navigation.findAll({
        include: [{
            model: db.navigation,
            as: 'Parent_Table'
        }]
    }).then(rData => {
        callback(rData)
    })
}

function getNavigationParent(db, callback) {
    db.navigation.findAll({
        where: {
            parent: null
        }
    }).then(rData => {
        callback(rData)
    })
}

function DestroyNavigation(db, DATA, callback) {
    db.navigation.destroy({
        where: {
            id: DATA
        }
    }).then(function(state, navigation) {
        if (state == 1) {
            callback("success");

        } else {
            callback("error")
        }
    })
}

function UpdateNavigation(db, DATA, callback) {
    db.navigation.findOne({
        where: {
            id: DATA.id
        }
    }).then(u => {
        u.update(DATA.data).then(s => {
            callback('success')
        }).catch(e => {
            callback('error')
        })
    }).catch(e => {
        callback('error')
    })
}

function CreateNavigation(db, DATA, callback) {
    db.navigation.create({
        name: DATA.name,
        key: DATA.key,
        parent: (DATA.parent) ? DATA.parent : null
    }).then(function(r) {
        callback("success")
    }).catch(function(r) {
        callback("error")
    })
}

function getNavigationTree(db, QUERY, callback) {
    var navTree = []
    db.navigation.findAll({
        where: {
            parent: null
        }
    }).then(rData => {
        async.each(rData, function(nav, cb_nav) {
            var o = {}
            o.navId = nav.id
            o.id = nav.key + '_navigation_parent'
            o.text = nav.name
            o.expanded = true
            o.children = []
            db.navigation.findAll({
                where: {
                    parent: nav.id
                }
            }).then(rData2 => {
                async.each(rData2, function(nav2, cb_nav2) {
                    var o2 = {}
                    o2.navId = nav2.id
                    o2.id = nav2.key + '_navigation_children'
                    o2.text = nav2.name
                    o2.leaf = true
                    db.user_navigation.findOne({
                        where: {
                            user: QUERY.user,
                            navigation: nav2.id
                        }
                    }).then(rData3 => {
                        if (rData3) {
                            o2.menuData = rData3
                            o.children.push(o2)
                        }
                        cb_nav2()
                    })
                }, function(err) {
                    if (o.children.length > 0) {
                        o.children.sort(function(a, b) {
                            if (a.navId < b.navId) return -1;
                            if (a.navId > b.navId) return 1;
                            return 0;
                        });
                        navTree.push(o)
                    }
                    cb_nav()
                })
            })
        }, function(err) {
            navTree.sort(function(a, b) {
                if (a.navId < b.navId) return -1;
                if (a.navId > b.navId) return 1;
                return 0;
            });
            callback(navTree)
        })
    }).catch(err => {
        callback(navTree)
    })
}

function getNavigationChildren(db, callback) {
    db.navigation.findAll({
        where: {
            parent: {
                [Op.not]: null
            }
        }
    }).then(rData => {
        callback(rData)
    })
}

function routerInit(app, dbFull) {
    var db = dbFull.HR_DB

    app.get('/getNavigationList', function(req, res) {
        getNavigationList(db, function(d) {
            res.setHeader('Content-Type', 'application/json');
            res.send(d);
        })
    })

    app.get('/getNavigationParent', function(req, res) {
        getNavigationParent(db, function(d) {
            res.setHeader('Content-Type', 'application/json');
            res.send(d);
        })
    })

    app.get('/getNavigationChildren', function(req, res) {
        getNavigationChildren(db, function(d) {
            res.setHeader('Content-Type', 'application/json');
            res.send(d);
        })
    });

    app.get('/getNavigationTree/:user', function(req, res) {
        getNavigationTree(db, req.params, function(d) {
            res.setHeader('Content-Type', 'application/json');
            res.send(d);
        })
    })
}

function socketInit(dbFull, socket) {
    var db = dbFull.HR_DB

    socket.on('DestroyNavigation', function(data) {
        DestroyNavigation(db, data, function(r) {
            socket.emit("DestroyNavigationSMS", r)
        })
    })

    socket.on('UpdateNavigation', function(data) {
        UpdateNavigation(db, data, function(r) {
            socket.emit("UpdateNavigationSMS", r)
        })
    })

    socket.on('CreateNavigation', function(data) {
        CreateNavigation(db, data, function(r) {
            socket.emit("CreateNavigationSMS", r)
        })
    })
}

module.exports.routerInit = routerInit;
module.exports.socketInit = socketInit;