Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('Category_Table', {
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
        tableName: 'category',
        underscored: true,
        timestamps: false,
    });
};