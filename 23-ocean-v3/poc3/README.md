# Ocean V3 Dynamic Fee PoC


### Introduction
This repo demonstrates the L1 dynamic fee in ocean protocol prior 
token minting. The fee itself is based on the price of the gas and 
the amount of the consumed/used gas (gas count).

The below formula describes how the fee is calculated:

```javascript
fee = usedGas * trx.gasprice ; // value in ETH
```

The following pseudocode shows how the fee is deducted:
```
startGas = gasLeft();
.....
super.mint()
.....
usedGas = startGas - gasleft();
fee = usedGas * trx.gasprice ; // value in ETH
require(deduct(fee));
transfer(token, msg.sender);
```
the `gas price` is changing over the time based on the network (Ethereum mainnet)
utilization. The value of `used gas` for minting new token can be 
estimated using the static analysis tools.

### Setup

```bash
npm install
```

### Test
```bash
npm run test
```

## Metamask
One of the most important setups is to integrate the same minting operation
with metamask.


### References
- https://solidity.readthedocs.io/en/develop/units-and-global-variables.html#special-variables-and-functions