Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('Vehicles_Table', {
        vehicle_no: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        driver_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        details: {
            type: Sequelize.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'vehicles',
        underscored: true,
        timestamps: false,
    });
};