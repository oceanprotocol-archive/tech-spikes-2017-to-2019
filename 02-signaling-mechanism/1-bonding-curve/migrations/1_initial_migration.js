/* global artifacts */
const Migrations = artifacts.require('./Migrations.sol')

const initialMigration = async (deployer) => {
    await deployer.deploy(Migrations)
}

module.exports = initialMigration
