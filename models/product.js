'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    website: DataTypes.STRING,
    product_id: DataTypes.STRING,
    main_title: DataTypes.STRING,
    sub_title: DataTypes.STRING,
    price_regular: DataTypes.STRING,
    price_promo: DataTypes.STRING,
    popularity: DataTypes.STRING,
    stock: DataTypes.STRING,
    cumm_comments: DataTypes.STRING,
    sell_counter: DataTypes.STRING,
    product_attributes: DataTypes.TEXT,
    description_images: DataTypes.TEXT,
    sizes: DataTypes.TEXT,
    colors: DataTypes.TEXT,
    images: DataTypes.TEXT,
    sku: DataTypes.TEXT,
    looked_watched: DataTypes.TEXT,
    StoreId: DataTypes.UUID
  }, {});
  Product.associate = function(models) {
    Product.belongsTo(models.Store);
  };
  return Product;
};