module.exports = function() {};
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const async = require('async');
const pdf = require('html-pdf');
const multer = require('multer');
const xlsx = require('xlsx');
const excel = require('exceljs');
var moment = require('moment');
const upload = multer({
    dest: 'public/uploads/'
});
var monthShortCapsNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];



function routerInit(app, dbFull) {
    var db = dbFull.HR_DB

    app.get('/getOthersList', function(req, res) {
        res.setHeader('Content-Type', 'application/json');

        var QUERY = (req.query) ? req.query : {};
        var SEARCH = {};
        var f = new Date();
        var t = new Date();
        var f = moment((f.getFullYear()) + '-' + (f.getMonth() + 1) + '-' + f.getDate())
        SEARCH.date = {};
        SEARCH.date = {
            [Op.between]: [f, f]
        };

        if (QUERY.deposit_type) {
            SEARCH.deposit_type = QUERY.deposit_type;
        }

        if (QUERY.name) {

            SEARCH = {
                name: {
                    [Op.like]: '%' + QUERY.name + '%'
                }
            };

        }

        if (QUERY.from_date != null && QUERY.to_date != null) {
            var f = new Date(QUERY.from_date);
            var t = new Date(QUERY.to_date);
            var f = (f.getFullYear()) + '-' + (f.getMonth() + 1) + '-' + f.getDate();
            var t = (t.getFullYear()) + '-' + (t.getMonth() + 1) + '-' + t.getDate();
            SEARCH.date = {};
            SEARCH.date = {
                [Op.between]: [f, t]
            };

        }
        db.others.findAndCountAll({
            where: SEARCH,
            include: [{
                model: db.deposit_type,
            }],
            offset: (QUERY.start) ? parseInt(QUERY.start) : 0,
            limit: (QUERY.limit) ? parseInt(QUERY.limit) : null
        }).then(rData => {
            res.send(rData);
        }).catch(err => {
            console.log(err)
            res.send([]);
        })
    });

    app.post('/getOthersList', function(req, res) {
        var QUERY = {};
        QUERY.id = req.body.id;
        QUERY.data = {};
        QUERY.data = req.body;
        delete QUERY.data.id;
        db.others.update(QUERY.data, {
            where: {
                id: QUERY.id
            }
        }).then(cB => {
            res.send(cB);
        }).catch(e => {
            res.send(e);
        })
    });

    app.post('/DestroyOthers', function(req, res) {
        db.others.destroy({
            where: req.body
        }).then(function(state, up) {
            res.send('success');
        }).catch(e => {
            res.send('error');
        })
    });

    app.post('/CreateOthers', function(req, res) {
        var DATA = req.body;
        db.others.create({
            name: DATA.name,
            date: DATA.date,
            deposit_type: DATA.deposit_type,
            cost: DATA.cost,
            remark: DATA.remark,
            create_date: new Date(),
        }).then(cB => {
            res.send('Success');
        }).catch(e => {
            console.log(e)
            res.send('Error');
        })
    });
}

module.exports.routerInit = routerInit;