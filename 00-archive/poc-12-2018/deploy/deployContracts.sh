#! /usr/bin/env bash
# -----------------------------------------------------------------------
# Project setup and first implementation of an upgradeable DIDRegistry
# -----------------------------------------------------------------------
# Clean up
rm -f zos.*

# Initialize project zOS project
# NOTE: Creates a zos.json file that keeps track of the project's details
# npx zos init keeper-contract 0.1.0
# Register contracts in the project as an upgradeable contract.
# NOTE: here we need to add the rest of oceanprotocol contracts
# npx zos add DIDRegistry -v --skip-compile
npx zos add Token  --skip-compile

# npx zos add OceanMarket  --skip-compile

# Deploy all implementations in the specified network.
# NOTE: Creates another zos.<network_name>.json file, specific to the network used, which keeps track of deployed addresses, etc.
# npx zos push --network $NETWORK --skip-compile  -v
npx zos push --network development  --skip-compile
# Request a proxy for the upgradeably contracts.
# Here we run initialize which replace contract constructors
# NOTE: A dapp could now use the address of the proxy specified in zos.<network_name>.json
# instance=MyContract.at(proxyAddress)
# npx zos create DIDRegistry --network $NETWORK --init initialize --args $OWNER -v
npx zos create Token --network development --init initialize

# retrieve the proxy address of token contract
# token=$(jq '.proxies."keeper-contract/OceanToken"[0].address ' zos.*.json)

# create instance of Ocean Market with token proxy address as argument
# npx zos create OceanMarket --network development --init initialize --args $token

# -----------------------------------------------------------------------
# Change admin priviliges to multisig
# -----------------------------------------------------------------------
# npx zos set-admin DIDRegistry $MULTISIG --network development --yes
