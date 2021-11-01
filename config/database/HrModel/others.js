const Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('Others_Table', {
        deposit_type: {
            type: Sequelize.INTEGER,
            references: {
                model: "deposit_type",
                key: "id"
            }
        },
        name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        date: {
            type: Sequelize.DATE
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
        tableName: 'others',
        underscored: true,
        timestamps: false,
    });
};