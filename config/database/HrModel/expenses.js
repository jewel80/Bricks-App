const Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('expenses_Table', {
        deposit_type: {
            type: Sequelize.INTEGER,
            references: {
                model: "deposit_type",
                key: "id"
            }
        },
        bricks_class: {
            type: Sequelize.INTEGER,
            references: {
                model: "bricks_class",
                key: "id"
            }
        },
        vehicles: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "vehicles",
                key: "id"
            }
        },
        status: {
            type: Sequelize.INTEGER,
            references: {
                model: "status",
                key: "id"
            }
        },
        coustomer_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        coustomer_address: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        coustomer_details: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        bricks_qty: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        net_price: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        deposit_taka: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },

        vehicles_cost: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        sales_date: {
            type: Sequelize.DATE
        },
        create_date: {
            type: Sequelize.DATE
        },
        remark: {
            type: Sequelize.STRING,
        }
    }, {
        tableName: 'expenses',
        underscored: true,
        timestamps: false,
    });
};