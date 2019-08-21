#! /usr/bin/env bash
# -----------------------------------------------------------------------
# Project setup and first implementation of an upgradeable DIDRegistry
# -----------------------------------------------------------------------
# Config variables for initializers
stake='10'
maxSlots='1'
# Clean up
rm -f zos.*

# List of contracts
declare -a contracts=("OceanToken")
# "DIDRegistry" "OceanToken" "OceanMarket" "OceanAuth" "ServiceAgreement" "AccessConditions" "PaymentConditions" "FitchainConditions" "ComputeConditions")

# Initialize project zOS project
# NOTE: Creates a zos.json file that keeps track of the project's details
npx zos init keeper 0.1.0 -v
# Register contracts in the project as an upgradeable contract.
for contract in "${contracts[@]}"
do
    npx zos add $contract -v --skip-compile
done

# Deploy all implementations in the specified network.
# NOTE: Creates another zos.<network_name>.json file, specific to the network used, which keeps track of deployed addresses, etc.
npx zos push --skip-compile  -v
# Request a proxy for the upgradeably contracts.
# Here we run initialize which replace contract constructors
# Since each contract initialize function could be different we can not use a loop
# NOTE: A dapp could now use the address of the proxy specified in zos.<network_name>.json
# instance=MyContract.at(proxyAddress)

# npx zos create DIDRegistry --init initialize --args $OWNER -v
token=$(npx zos create OceanToken --init -v)
# market=$(npx zos create OceanMarket --init initialize --args $token,$OWNER -v)
# npx zos create OceanAuth --init initialize --args $market -v
# service=$(npx zos create ServiceAgreement -v)
# npx zos create AccessConditions --init initialize --args $service -v
# npx zos create PaymentConditions --init initialize --args $service,$token -v
# npx zos create FitchainConditions --init initialize --args $service,$stake,$maxSlots -v
# npx zos create ComputeConditions --init initialize --args $service -v

# -----------------------------------------------------------------------
# Change admin priviliges to multisig
# -----------------------------------------------------------------------
for contract in "${contracts[@]}"
do
    npx zos set-admin $contract $MULTISIG --yes
done
