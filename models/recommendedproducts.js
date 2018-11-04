'use strict';
module.exports = (sequelize, DataTypes) => {
  const RecommendedProducts = sequelize.define('RecommendedProducts', {
    ProductId: DataTypes.UUID,
    PreviewProductId: DataTypes.UUID,
    tag: DataTypes.STRING
  }, {});
  RecommendedProducts.associate = function(models) {
    // associations can be defined here
  };
  return RecommendedProducts;
};