Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('S_Type_Table', {
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
        tableName: 's_type',
        underscored: true,
        timestamps: false,
    });
};