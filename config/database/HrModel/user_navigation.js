Sequelize = require('sequelize');

module.exports = function(sequelize) {
    return sequelize.define('User_Navigation_Table', {
        user: {
            type: Sequelize.INTEGER,
            references: {
                model: 'user',
                key: 'id'
            },
            allowNull: false,
            unique: 'uniqueUserNavigation'
        },
        navigation: {
            type: Sequelize.INTEGER,
            references: {
                model: 'navigation',
                key: 'id'
            },
            allowNull: false,
            unique: 'uniqueUserNavigation'
        },
        role: {
            type: Sequelize.INTEGER,
            references: {
                model: 'role',
                key: 'id'
            },
            allowNull: false,
            defaultValue: 1
        }
    }, {
        tableName: 'user_navigation',
        underscored: true,
        timestamps: false,
    });
};