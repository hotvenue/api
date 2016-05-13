module.exports = function location(sequelize, DataTypes) {
  const Location = sequelize.define('Location', {
    locationId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    geoLatitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: -90, max: 90 },
    },

    geoLongitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: -180, max: 180 },
    },
  }, {
    classMethods: {
      associate: (models) => {
        Location.hasMany(models.Video);
      },
    },
  });

  return Location;
};
