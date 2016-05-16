'use strict';

module.exports = function user(sequelize, DataTypes) {
  const User = sequelize.define('User', {
    userId: {
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
        User.hasMany(models.Video);
        User.hasMany(models.TmpCode);
      },
    },
  });

  return User;
};
