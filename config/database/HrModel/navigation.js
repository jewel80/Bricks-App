Sequelize = require('sequelize');

module.exports = function(sequelize){
    return sequelize.define('Navigation_Table', {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        key: {
            type: Sequelize.STRING,
            allowNull: false
        },
        parent: {
            type: Sequelize.INTEGER,
            references: {
              model: "navigation",
              key:   "id"
            },
            allowNull: true,
            defaultValue: null
        }
    },{
        tableName: 'navigation',
        underscored: true,
        timestamps: false,
    });
};