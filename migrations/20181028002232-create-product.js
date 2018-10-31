'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Products', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      website: {
        type: Sequelize.STRING
      },
      product_id: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      main_title: {
        type: Sequelize.STRING
      },
      sub_title: {
        type: Sequelize.STRING
      },
      price_regular: {
        type: Sequelize.STRING
      },
      price_promo: {
        type: Sequelize.STRING
      },
      popularity: {
        type: Sequelize.STRING
      },
      stock: {
        type: Sequelize.STRING
      },
      cumm_comments: {
        type: Sequelize.STRING
      },
      sell_counter: {
        type: Sequelize.STRING
      },
      product_attributes: {
        type: Sequelize.TEXT
      },
      description_images: {
        type: Sequelize.TEXT
      },
      sizes: {
        type: Sequelize.TEXT
      },
      colors: {
        type: Sequelize.TEXT
      },
      images: {
        type: Sequelize.TEXT
      },
      sku: {
        type: Sequelize.TEXT
      },
      looked_watched: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Products');
  }
};