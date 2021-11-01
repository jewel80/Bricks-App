Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('Bricks_Class_Table', {
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
        tableName: 'bricks_class',
        underscored: true,
        timestamps: false,
    });
};