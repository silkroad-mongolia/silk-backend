'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.bulkInsert('Users', [{
    id: 10,
    email: 'tsenguun@uw.edu',
    password: '$2a$10$XKeJvy3snYjyCjzV4NcX.OQdWhbwb3BGJndRAI56zzj/UQz.v3/Bm',
    createdAt: new Date(),
    updatedAt: new Date()
   }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
