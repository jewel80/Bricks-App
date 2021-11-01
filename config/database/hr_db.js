function init(sequelize) {
    /////*******************##### MODELER FILE INCLUDING STARTS  *#####****************/////
    /// Note: expenses is sales and expenses is sales  

    this.user = require(__dirname + '/HrModel/user.js')(sequelize);
    this.role = require(__dirname + '/HrModel/role.js')(sequelize);
    this.navigation = require(__dirname + '/HrModel/navigation.js')(sequelize);
    this.user_navigation = require(__dirname + '/HrModel/user_navigation.js')(sequelize);

    this.status = require(__dirname + '/HrModel/status.js')(sequelize);
    this.vehicles = require(__dirname + '/HrModel/vehicles.js')(sequelize);
    this.bricks_class = require(__dirname + '/HrModel/bricks_class.js')(sequelize);
    this.category = require(__dirname + '/HrModel/category.js')(sequelize);
    this.deposit_type = require(__dirname + '/HrModel/deposit_type.js')(sequelize);
    this.expenses = require(__dirname + '/HrModel/expenses.js')(sequelize);
    this.s_type = require(__dirname + '/HrModel/s_type.js')(sequelize);
    this.sales = require(__dirname + '/HrModel/sales.js')(sequelize);
    this.others = require(__dirname + '/HrModel/others.js')(sequelize);

    /////*******************#####  RIPS MODELER FILE INCLUDING ENDS  #####****************/////


    ////////////////%%%%#####  RIPS TABLE RELATIONSHIP STARTS  #####%%%%////////////////////

    /*=========================================================================================================
    =========================================================================================================
    =========================================================================================================*/


    this.navigation.belongsTo(this.navigation, {
        foreignKey: 'parent',
        as: 'Parent_Table'
    })
    this.user_navigation.belongsTo(this.user, {
        foreignKey: 'user'
    })
    this.user_navigation.belongsTo(this.navigation, {
        foreignKey: 'navigation'
    })
    this.user_navigation.belongsTo(this.role, {
        foreignKey: 'role'
    })


    this.expenses.belongsTo(this.status, {
        foreignKey: 'status'
    });
    this.expenses.belongsTo(this.vehicles, {
        foreignKey: 'vehicles'
    });
    this.expenses.belongsTo(this.bricks_class, {
        foreignKey: 'bricks_class'
    });
    // this.expenses.belongsTo(this.category, {
    //     foreignKey: 'category'
    // });
    this.expenses.belongsTo(this.deposit_type, {
        foreignKey: 'deposit_type'
    });


    this.sales.belongsTo(this.category, {
        foreignKey: 'category'
    });
    this.sales.belongsTo(this.s_type, {
        foreignKey: 's_type'
    });

    this.others.belongsTo(this.deposit_type, {
        foreignKey: 'deposit_type'
    });





    ////////////////%%%%#####  RIPS TABLE RELATIONSHIP ENDS  #####%%%%////////////////////
    sequelize.sync({
        force: false
    }).then(function(d) {
        if (!d) {
            console.log('An error occurred while creating the table:', d)
        } else {
            console.log('It worked!')
        }
    })
}

module.exports.init = init;