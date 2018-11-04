'use strict';
module.exports = (sequelize, DataTypes) => {
  const PreviewProduct = sequelize.define('PreviewProduct', {
    id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    productId: DataTypes.STRING,
    image: DataTypes.STRING,
    price: DataTypes.STRING,
    title: DataTypes.STRING,
    StoreId: DataTypes.UUID
  }, {});
  PreviewProduct.associate = function(models) {
      PreviewProduct.belongsTo(models.Store);
      PreviewProduct.belongsToMany(models.Product, {through: models.RecommendedProducts});
  };
  return PreviewProduct;
};