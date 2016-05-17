'use strict';

module.exports = function createUser(sequelize, DataTypes) {
  const user = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  }, {
    classMethods: {
      associate: (models) => {
        user.hasMany(models.video);
        user.hasMany(models.tmpCode);
      },
    },
  });

  return user;
};
