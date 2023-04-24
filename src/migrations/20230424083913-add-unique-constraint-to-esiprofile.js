'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('EsiProfiles', {
      type: 'unique',
      fields: ['CharacterID']
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('EsiProfiles', 'CharacterID');
  }
};
