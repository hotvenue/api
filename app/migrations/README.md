# Migrations

Here goes all the migration files

The migration format is:

```javascript
module.exports = {
  up(models) {
    models.sequelize.queryInterface.describeTable('table')
      .then((fields) => {
        if (!fields.hasOwnProperty('hash')) {
          return models.sequelize.queryInterface.addColumn('table', 'hash', {
            type: fields.extension.type,
          });
        }

        return true;
      });
  },

  down(/* models */) {

  },
};
```
