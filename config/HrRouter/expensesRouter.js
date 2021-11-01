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

function removeDuplicate(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}
Number.prototype.formatMoney = function(c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
global.dailyReportHead = function() {
    var dRH = '<head>' +
        '<style>' +
        'table, th, td {' +
        'border: 1px solid black;' +
        'border-collapse: collapse;' +
        // 'page-break-inside: avoid;' +
        '}' +

        'table { page-break-inside:auto }' +
        'tr    { page-break-inside:avoid; page-break-after:auto }' +

        // 'tr{page-break-inside: avoid;}' +

        /*'tr {'+
            'page-break-inside: avoid;'+
            'page-break-after: auto;height: 10px;'+
        '}' +*/


        'th, td {' +
        'padding: 6px;' +
        'line-height: 1;' +
        'align: center;' +
        '}' +

        'h1, h2, h3, h4, h5, h6 {' +
        'line-height: 0;' +
        'text-align: center;' +
        '}' +

        '#pageBody {' +
        'font-size: 9px;' +
        'padding: 6px 20px 6px 20px;' +
        'page-break-after: always;' +
        '}' +

        '#pageBody:last-child {' +
        'page-break-after: avoid;' +
        '}' +

        '</style>' +
        '</head>';
    return dRH;
}


global.headerContents = function() {
    var hC = '<div style="' +
        'color: #444;' +
        'font-size: 10px;' +
        'position: fixed;' +
        'top: 15;' +
        'right: 15;' +
        '">' +
        '<span>PRINT TIME: ' +
        new Date() +
        '</span>' +
        '</div>' +
        '<br />' +
        '<h3 style="' +
        'line-height: 0;' +
        '">' + 'Sun Bricks Limited' + '</h3>';
    return hC;
}
global.footerContents = function() {
    var fC = '<div style="' +
        'color: #444;' +
        'font-size: 9px;' +
        'position: fixed;' +
        'bottom: 15;' +
        'right: 15;' +
        '">' +
        '<span>PAGE {{page}}</span>' +
        ' OUT OF ' +
        '<span>{{pages}}</span>' +
        '</div>';
    return fC;
}

function routerInit(app, dbFull) {
    var db = dbFull.HR_DB

    app.get('/getExpensesList', function(req, res) {
        res.setHeader('Content-Type', 'application/json');

        var QUERY = (req.query) ? req.query : {};
        var SEARCH = {};
        var f = new Date();
        var t = new Date();
        var f = moment((f.getFullYear()) + '-' + (f.getMonth() + 1) + '-' + f.getDate())
        SEARCH.sales_date = {};

        SEARCH.sales_date = {
            [Op.between]: [f, f]
        };

        if (QUERY.bricks_class) {
            SEARCH.bricks_class = QUERY.bricks_class;
        }

        if (QUERY.coustomer_name) {

            SEARCH = {
                coustomer_name: {
                    [Op.like]: '%' + QUERY.coustomer_name + '%'
                }
            };

        }

        // if (QUERY.from_date != null && QUERY.to_date != null) {
        //     var f = new Date(QUERY.from_date);
        //     var t = new Date(QUERY.to_date);
        //     var f = (f.getFullYear()) + '-' + (f.getMonth() + 1) + '-' + f.getDate();
        //     var t = (t.getFullYear()) + '-' + (t.getMonth() + 1) + '-' + t.getDate();
        //     SEARCH.sales_date = {};
        //     SEARCH.sales_date = {
        //         [Op.between]: [f, t]
        //     };

        // }
        
        console.log(SEARCH)
        db.expenses.findAndCountAll({
            // where: SEARCH,
            include: [{
                model: db.deposit_type,
            }, {
                model: db.bricks_class,
            }, {
                model: db.vehicles,
            }, {
                model: db.status,
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


    /*app.get('/getExpensesList', function(req, res) {
        res.setHeader('Content-Type', 'application/json');

        var QUERY = (req.query) ? req.query : {};
        var SEARCH = {};
        var f = new Date();
        var t = new Date();
        var f = moment((f.getFullYear()) + '-' + (f.getMonth() + 1) + '-' + f.getDate())
        SEARCH.sales_date = {};
        SEARCH.sales_date = {
            [Op.between]: [f, f]
        };

        if (QUERY.bricks_class) {
            SEARCH.bricks_class = QUERY.bricks_class;
        }

        if (QUERY.coustomer_name) {

            SEARCH = {
                coustomer_name: {
                    [Op.like]: '%' + QUERY.coustomer_name + '%'
                }
            };

        }

        if (QUERY.from_date != null && QUERY.to_date != null) {
            var f = new Date(QUERY.from_date);
            var t = new Date(QUERY.to_date);
            var f = (f.getFullYear()) + '-' + (f.getMonth() + 1) + '-' + f.getDate();
            var t = (t.getFullYear()) + '-' + (t.getMonth() + 1) + '-' + t.getDate();
            SEARCH.sales_date = {};
            SEARCH.sales_date = {
                [Op.between]: [f, t]
            };

        }
        console.log(SEARCH)
        db.expenses.findAndCountAll({
            where: SEARCH,
            include: [{
                model: db.deposit_type,
            }, {
                model: db.bricks_class,
            }, {
                model: db.vehicles,
            }, {
                model: db.status,
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
*/
    app.post('/PrintSalesDataDetails', function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        // var Datas = [];
        var QUERY = (req.body) ? req.body : {};
        var SEARCH = {};
        if (QUERY.bricks_class) {
            SEARCH.bricks_class = QUERY.bricks_class;
        }
        if (QUERY.coustomer_name) {

            SEARCH = {
                coustomer_name: {
                    [Op.like]: '%' + QUERY.coustomer_name + '%'
                }
            };

        }
        if (QUERY.from_date != null && QUERY.to_date != null) {
            var f = new Date(QUERY.from_date);
            var t = new Date(QUERY.to_date);
            var f = (f.getFullYear()) + '-' + (f.getMonth() + 1) + '-' + f.getDate();
            var t = (t.getFullYear()) + '-' + (t.getMonth() + 1) + '-' + t.getDate();
            SEARCH.sales_date = {};
            SEARCH.sales_date = {
                [Op.between]: [f, t]
            };

        }
        db.expenses.findAll({
            where: SEARCH,
            include: [{
                model: db.deposit_type,
            }, {
                model: db.bricks_class,
            }, {
                model: db.vehicles,
            }, {
                model: db.status,
            }],
            order: [
                ['id', 'ASC']
            ]
        }).then(rData => {
            var Datas = JSON.parse(JSON.stringify(rData));

            // console.log('========S===========')
            // console.log(Datas)
            // console.log(new Date())
            // console.log('=========E==========')


            var options = {
                format: 'A4',
                orientation: "landscape",
            };

            var htmlData =
                '<!DOCTYPE html><body>' +
                dailyReportHead() +
                '<div id="pageBody">';

            htmlData += '<table style="width:100%;">' +
                // htmlData += '<table  style="width:100%"; >' +
                '<tr>' +
                '<th> SI </th>' +
                '<th> তারিখ </th>' +
                '<th> ক্রেতা নাম </th>' +
                '<th> ঠিকানা </th>' +
                '<th> বর্ণনা </th>' +
                '<th> শ্রেণী </th>' +
                '<th> পরিমাপ </th>' +
                '<th> নীট মূল্য </th>' +
                '<th> মোট জমা </th>' +
                '<th> বাকী </th>' +
                '<th> গাড়ী নং </th>' +
                '<th> গাড়ী ভাড়া </th>' +
                '<th> এড/দা </th>' +
                '</tr>';
            var tableRowHtml = '';
            var total_bricksQty = 0;
            var total_netPrice = 0;
            var total_depositTaka = 0;
            var total_duePrice = 0;
            for (var i = 0; i < Datas.length; i++) {

                var bricksQty = Datas[i].bricks_qty
                var netPrice = Datas[i].net_price
                var depositTaka = Datas[i].deposit_taka
                var duePrice = (Datas[i].net_price - Datas[i].deposit_taka);
                total_bricksQty += bricksQty;
                total_netPrice += netPrice;
                total_depositTaka += depositTaka;
                total_duePrice += duePrice;
                var serial = i + 1;

                tableRowHtml += '<tr>' +
                    '<td align="left">' + serial + '</td>' +
                    '<td align="left">' + Datas[i].sales_date + '</td>' +
                    '<td align="left">' + Datas[i].coustomer_name + '</td>' +
                    '<td align="center">' + Datas[i].coustomer_address + '</td>' +
                    '<td align="left">' + Datas[i].coustomer_details + '</td>' +
                    '<td align="left">' + Datas[i].Bricks_Class_Table.name + '</td>' +
                    '<td align="right">' + bricksQty + '</td>' +
                    '<td align="right">' + netPrice.formatMoney(2, '.', ',') + '</td>' +
                    '<td align="right">' + depositTaka.formatMoney(2, '.', ',') + '</td>' +
                    '<td align="right">' + duePrice.formatMoney(2, '.', ',') + '</td>' +
                    '<td align="left">' + Datas[i].Vehicles_Table.vehicle_no + '</td>' +
                    '<td align="left">' + Datas[i].vehicles_cost + '</td>' +
                    '<td align="left">' + Datas[i].remark + '</td>' +
                    '</tr>';
            }
            // console.log(tableRowHtml)
            htmlData += tableRowHtml;

            htmlData += '<tr>' +
                '<th colspan="6" align="left" bgcolor="#DDDDDD"><big> TOTAL</big> </th>' +
                '<th align="right" bgcolor="#DDDDDD"><big>' + total_bricksQty + '</big></th>' +
                '<th align="right" bgcolor="#DDDDDD"><big>' + total_netPrice.formatMoney(2, '.', ',') + '</big></th>' +
                '<th align="right" bgcolor="#DDDDDD"><big>' + total_depositTaka + '</big></th>' +
                '<th align="right" bgcolor="#DDDDDD"><big>' + total_duePrice.formatMoney(2, '.', ',') + '</big></th>' +

                '<th colspan="3" bgcolor="#DDDDDD"></th>' +
                '</tr></table></div></body></html>';


            options = {
                format: 'A4',
                orientation: "landscape",
                header: {
                    height: "30mm",
                    contents: headerContents() +
                        '<h5 style="' +
                        'line-height: 0;' +
                        '">বিক্রয়ের সকল তথ্য</h5></br></br>'
                },
                footer: {
                    height: "15mm",
                    contents: footerContents()
                }
            };
            pdf.create(htmlData, options).toFile('./public/pdf/PrintSalesDataDetails.pdf', function(err, resource) {
                if (err) return console.log(err);
                res.send('success');
            });
        })
    });

    // app.get('/getExpensesList', function(req, res) {
    //     res.setHeader('Content-Type', 'application/json');
    //     db.expenses.findAndCountAll({
    //         // where: SEARCH,
    //         include: [{
    //             model: db.deposit_type,
    //         }, {
    //             model: db.bricks_class,
    //         }, {
    //             model: db.vehicles,
    //         }, {
    //             model: db.status,
    //         }, ],
    //     }).then(rData => {
    //         res.send(rData);
    //     }).catch(err => {
    //         console.log(err)
    //         res.send([]);
    //     })
    // });

    app.get('/getDepositTypeList', function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        db.deposit_type.findAll().then(rData => {
            res.send(rData);
        }).catch(err => {
            res.send([]);
        })
    });

    app.get('/getBricksClassList', function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        db.bricks_class.findAll().then(rData => {
            res.send(rData);
        }).catch(err => {
            res.send([]);
        })
    });

    app.get('/getVehiclesList', function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        db.vehicles.findAll().then(rData => {
            res.send(rData);
        }).catch(err => {
            res.send([]);
        })
    });

    app.get('/getStatusList', function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        db.status.findAll().then(rData => {
            res.send(rData);
        }).catch(err => {
            res.send([]);
        })
    });


    app.get('/getProductTypeList', function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        db.product_type.findAll().then(rData => {
            res.send(rData);
        }).catch(err => {
            res.send([]);
        })
    });

    app.post('/getExpensesList', function(req, res) {
        var QUERY = {};
        QUERY.id = req.body.id;
        QUERY.data = {};
        QUERY.data = req.body;
        delete QUERY.data.id;
        db.expenses.update(QUERY.data, {
            where: {
                id: QUERY.id
            }
        }).then(cB => {
            res.send(cB);
        }).catch(e => {
            res.send(e);
        })
    });

    app.post('/DestroyExpenses', function(req, res) {
        db.expenses.destroy({
            where: req.body
        }).then(function(state, up) {
            res.send('success');
        }).catch(e => {
            res.send('error');
        })
    });

    app.post('/CreateBricksClass', function(req, res) {
        var DATA = req.body;
        db.bricks_class.create({
            name: DATA.name,
            description: DATA.description
        }).then(cB => {
            res.send('Success');
        }).catch(e => {
            res.send('Error');
        })
    });

    app.post('/CreateDepositType', function(req, res) {
        var DATA = req.body;
        db.deposit_type.create({
            name: DATA.name,
            details: DATA.details
        }).then(cB => {
            res.send('Success');
        }).catch(e => {
            res.send('Error');
        })
    });

    app.post('/CreateVehical', function(req, res) {
        var DATA = req.body;
        db.vehicles.create({
            vehicle_no: DATA.vehicle_no,
            driver_name: DATA.driver_name,
            details: DATA.details
        }).then(cB => {
            res.send('Success');
        }).catch(e => {
            res.send('Error');
        })
    });


    app.post('/CreateExpenses', function(req, res) {
        var DATA = req.body;
        var d = new Date();
        db.expenses.create({
            coustomer_name: DATA.coustomer_name,
            coustomer_address: DATA.coustomer_address,
            coustomer_details: DATA.coustomer_details,
            bricks_qty: DATA.bricks_qty,
            net_price: DATA.net_price,
            deposit_taka: DATA.deposit_taka,
            sales_date: DATA.sales_date,
            vehicles_cost: DATA.vehicles_cost,
            // deposit_type: DATA.deposit_type,
            bricks_class: DATA.bricks_class,
            vehicles: DATA.vehicles,
            status: DATA.status,
            remark: DATA.remark,
            create_date: new Date(),
        }).then(cB => {
            res.send('Success');
        }).catch(e => {
            console.log(e)
            res.send('Error');
        })
    });



    app.get('/getProductTypeList', function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        db.product_type.findAll().then(rData => {
            res.send(rData);
        }).catch(err => {
            res.send([]);
        })
    });



}

module.exports.routerInit = routerInit;







/*if (QUERY.bricks_class) {
            SEARCH.bricks_class = QUERY.bricks_class;
        } else if (QUERY.coustomer_name) {
           
            SEARCH = {
                coustomer_name: {
                    [Op.like]: '%' + QUERY.coustomer_name + '%'
                }
            };

        } else if (QUERY.from_date != null && QUERY.to_date != null) {
           
            var f = new Date(QUERY.from_date);
            var t = new Date(QUERY.to_date);
            var f = (f.getFullYear()) + '-' + (f.getMonth() + 1) + '-' + f.getDate();
            var t = (t.getFullYear()) + '-' + (t.getMonth() + 1) + '-' + t.getDate();

            SEARCH.sales_date = {};
            SEARCH.sales_date = {
                [Op.between]: [f, t]
            };

        } else {
            var f = new Date();
            var t = new Date();
            var f = moment((f.getFullYear()) + '-' + (f.getMonth() + 1) + '-' + f.getDate())
            SEARCH.sales_date = {};
            SEARCH.sales_date = {
                [Op.between]: [f, f]
            };

        }*/