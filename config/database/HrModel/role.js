Sequelize = require('sequelize');

module.exports = function(sequelize){
    return sequelize.define('Role_Table', {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        }
    },{
        tableName: 'role',
        underscored: true,
        timestamps: false,
    });
};