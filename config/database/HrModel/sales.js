const Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('expenses_Table', {
        s_type: {
            type: Sequelize.INTEGER,
            references: {
                model: "s_type",
                key: "id"
            }
        },
        expenses_reason: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        sales_date: {
            type: Sequelize.DATE
        },
        category: {
            type: Sequelize.INTEGER,
            references: {
                model: "category",
                key: "id"
            }
        },
        cost: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        create_date: {
            type: Sequelize.DATE
        },
        remark: {
            type: Sequelize.STRING,
        }
    }, {
        tableName: 'sales',
        underscored: true,
        timestamps: false,
    });
};