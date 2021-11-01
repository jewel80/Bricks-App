Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('status_Table', {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        details: {
            type: Sequelize.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'status',
        underscored: true,
        timestamps: false,
    });
};