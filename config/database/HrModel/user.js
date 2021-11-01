Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('User_Table', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        is_online: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: 0,
        },
        last_login: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        },
        last_logout: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        }
    }, {
        tableName: 'user',
        underscored: true,
        timestamps: false,
    });
};


