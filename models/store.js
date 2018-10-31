'use strict';
module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    cover_image: DataTypes.STRING,
    age: DataTypes.STRING,
    star_image: DataTypes.STRING,
    star_count: DataTypes.STRING,
    gold_seller_image: DataTypes.STRING,
    gold_continuous_image: DataTypes.STRING,
    description: DataTypes.STRING,
    service: DataTypes.STRING,
    logistics: DataTypes.STRING,
    store_link: DataTypes.STRING,
    ratings_link: DataTypes.STRING,
    shopkeeper: DataTypes.STRING,
    qualification: DataTypes.STRING
  }, {});
  Store.associate = function(models) {
    Store.hasMany(models.Product);
    Store.hasMany(models.PreviewProduct);
  };
  return Store;
};