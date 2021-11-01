module.exports = function() {};

function mainRouter(app, db, io) {

    const expenses = require(__dirname + '/HrRouter/expensesRouter.js')
    const sales = require(__dirname + '/HrRouter/salesRouter.js')
    const others = require(__dirname + '/HrRouter/othersRouter.js')

    const userRouter = require(__dirname + '/HrRouter/userRouter.js')
    const navigationRouter = require(__dirname + '/HrRouter/navigationRouter.js')
    
    




    others.routerInit(app, db)
    expenses.routerInit(app, db)
    sales.routerInit(app, db)

    userRouter.routerInit(app, db)
    navigationRouter.routerInit(app, db)


    io.on('connection', function(s) {
        //kycArchive.socketInit(db, s)
        userRouter.socketInit(db, s)
        navigationRouter.socketInit(db, s)
    })

    //////////////////// ACCOUNT ROUTER ENDS ///////////////////////
}

module.exports.mainRouter = mainRouter;