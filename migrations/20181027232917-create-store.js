'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Stores', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING
      },
      cover_image: {
        type: Sequelize.STRING
      },
      age: {
        type: Sequelize.STRING
      },
      star_image: {
        type: Sequelize.STRING
      },
      star_count: {
        type: Sequelize.STRING
      },
      gold_seller_image: {
        type: Sequelize.STRING
      },
      gold_continuous_image: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      service: {
        type: Sequelize.STRING
      },
      logistics: {
        type: Sequelize.STRING
      },
      store_link: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      ratings_link: {
        type: Sequelize.STRING
      },
      shopkeeper: {
        type: Sequelize.STRING
      },
      qualification: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Stores');
  }
};