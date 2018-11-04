'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('RecommendedProducts', {
       ProductId: {
        type: Sequelize.UUID,
         primaryKey: true,
      },
      PreviewProductId: {
        type: Sequelize.UUID,
          primaryKey: true,
      },
      tag: {
        type: Sequelize.STRING,
          primaryKey: true,
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
    return queryInterface.dropTable('RecommendedProducts');
  }
};