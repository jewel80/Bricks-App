Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('Customer_Table', {
        firstname: {
            type: Sequelize.STRING
        },
        lastname: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        age: {
            type: Sequelize.INTEGER
        },
        copyright: {
            type: Sequelize.STRING,
            defaultValue: "https://loizenai.com"
        }
    }, {
        tableName: 'customer',
        underscored: true,
        timestamps: false,
    });
};