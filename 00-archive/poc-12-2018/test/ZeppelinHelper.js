/* eslint-env mocha */
/* eslint-disable no-console */
/* global artifacts */
const { encodeCall } = require('zos-lib')
/* eslint-disable-next-line security/detect-child-process */
const { execSync } = require('child_process')
const glob = require('glob')
const fs = require('fs')

// const MultiSigWallet = artifacts.require('MultiSigWallet')
const debug = ' -v'
const stdio = 'inherit'
module.exports = class ZeppelinHelper {
    constructor(contractName) {
        this.contractName = contractName
        // build dependencies
        this.dependencies = {
            OceanToken: [],
            OceanReward: ['OceanRandao'],
            OceanBondingCurve: ['OceanToken'],
            OceanRandao: ['OceanToken'],
            OceanVoting: ['OceanToken'],
            OceanRegistry: ['OceanVoting'],
        }
    }

    addDependency(dep) {
        this.dependencies[this.contractName].push(dep)
    }

    // 1. first step
    async pushContract(admin) {
        // remove config files
        try {
            await execSync('rm -f zos.*', { stdio: 'ignore' })
        } catch (e) {
            console.log(e)
            console.log('Continuing anyways')
        }
        let net = process.env.NETWORK
        console.log('Creating session with network:' + net + ' and admin:', admin)
        await execSync('zos session --network ' + net + ' --from ' + admin)

        await execSync('npx zos init keeper 0.1.0 --force')
        // push contract to network
        await this.addContract(this.contractName)
        // push contract to network
        // note: remove '--skip-compile' or 'build' directory to avoid "Error: No AST nodes with id 2011 found"
        await execSync('npx zos push --network ' + net + ' ' + debug)
    }

    // add contract to zos and push to network
    async addContract(contract) {
        //console.log('Adding contracts to zos: ', contract)
        for (let dep of this.dependencies[contract]) {
            //console.log('Adding contract: ' + dep)
            await this.addContract(dep)
        }
        // add contract to zos
        await execSync('npx zos add ' + contract + ' --skip-compile' + debug)
    }

    // 2. second step
    async createContract(owner, upgrade) {
        this.owner = owner
        this.upgrade = upgrade
        this.addresses = {}
        this.net = process.env.NETWORK
        // create contract proxy
        await this.createContractProxy(this.contractName)
    }

    async createContractProxy(contract) {
        if (this.addresses[contract] === undefined) {
            console.log('Initializing: ', contract)
            for (let dep of this.dependencies[contract]) {
                console.log('Creating dependencies proxy: ' + dep)
                await this.createContractProxy(dep)
            }
            let cmd
            // create proxy
            switch (contract) {
                case 'OceanToken':
                    cmd = 'OceanToken --init '
                    break
                case 'OceanReward':
                    cmd = 'OceanReward --init initialize --args ' + this.addresses['OceanToken'] + ',' + this.owner
                    break
                case 'OceanBondingCurve':
                    cmd = 'OceanBondingCurve --init initialize --args ' + this.addresses['OceanToken'] + ',' + this.owner
                    break
                case 'OceanRandao':
                    cmd = 'OceanRandao --init initialize --args ' + this.addresses['OceanToken']
                    break
                case 'OceanVoting':
                    cmd = 'OceanVoting --init initialize --args ' + this.addresses['OceanToken']
                    break
                case 'OceanRegistry':
                    cmd = 'OceanRegistry --init initialize --args ' + this.addresses['OceanToken'] + ',' + this.addresses['OceanVoting']
                    break
                default:
                    throw Error(contract + ' Not implemented in create')
            }
            //console.log('cmd:', cmd)
            let address = await execSync('npx zos create ' + cmd + debug).toString().trim()
            this.addresses[contract] = address
        } else {
            console.log('skipping: ' + contract + ' already initialized')
        }
    }

    getProxyAddress(contractName) {
        return this.addresses[contractName]
    }

}
