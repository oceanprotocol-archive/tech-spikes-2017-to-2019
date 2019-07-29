extern crate rustc_hex;
extern crate tokio_core; 
extern crate web3;

use std::{time};
use web3::contract::{Contract, Options};
use web3::types::{Address, U256 };
use web3::futures::{Future, Stream};
use web3::types::FilterBuilder;

fn main() {
    let did :U256 = U256::from(2);
    // interact(did);
    resolve(did);
}

fn resolve(did : U256) {
    let (_eloop, transport) = web3::transports::Http::new("http://localhost:8545").unwrap();
    let web3 = web3::Web3::new(transport);
    let accounts = web3.eth().accounts().wait().unwrap();

    // Accessing existing contract
    let contract_address: Address = "0e6Cfa1D0692cEB4d8EA3FacEEfa08532Ef67715".parse().unwrap();
    let contract = Contract::from_json(
        web3.eth(),
        contract_address,
        include_bytes!("../truffle/build/Verifier.abi"),
    )
    .unwrap();
    println!("Contract deployed to: 0x{}", contract.address()); 

    //interact with the contract
    let my_account: Address = accounts[0]; 

    // resolve the challenge after voting finish
    contract.call("resolveChallenge", (did, ), my_account, Options::default());

    // query info in smart contract
    // let result = contract.query("getInfo", (did, 1,), None, Options::default(), None);
    // let status: U256 = result.wait().unwrap();
    // println!("info [1] nPos := {} now", status);

    // let result = contract.query("getInfo", (did, 2,), None, Options::default(), None);
    // let status: U256 = result.wait().unwrap();
    // println!("info [2] nNeg := {} now", status);

    // let result = contract.query("getInfo", (did, 3,), None, Options::default(), None);
    // let status: U256 = result.wait().unwrap();
    // println!("info [3] Quorum := {} now", status);

    // let result = contract.query("getInfo", (did, 4,), None, Options::default(), None);
    // let status: U256 = result.wait().unwrap();
    // println!("info [3] nVoter := {} now", status);

    // check the status of challenge for dataset
    let result = contract.query("queryVerification", (did,), None, Options::default(), None);
    let status: bool = result.wait().unwrap();
    assert_eq!(status, true);
    println!("por verification status := {} now", status);

}

fn interact(did : U256) {
    // create event loop to monitor the events from contract
    let mut eloop = tokio_core::reactor::Core::new().unwrap();
    let web3 = web3::Web3::new(web3::transports::Http::with_event_loop("http://localhost:8545", &eloop.handle(), 1).unwrap());

    // Accessing existing contract
    let my_account = "2a0781da734e639024529a18c5f90ff8f8941afe".parse().unwrap();
    let contract_address: Address = "0e6Cfa1D0692cEB4d8EA3FacEEfa08532Ef67715".parse().unwrap();
    let contract = Contract::from_json(
        web3.eth(),
        contract_address,
        include_bytes!("../truffle/build/Verifier.abi"),
    )
    .unwrap();
    println!("contract deployed at: {}", contract.address());

    eloop.run(web3.eth().accounts().then(|accounts| {
        //Change state of the contract
        contract.call("addVerifier", (my_account,), my_account, Options::default());
        println!("add := {} as a verifier", my_account);

        // Filter for Hello event in our contract
        let filter = FilterBuilder::default()
            .address(vec![contract.address()])
            .topics(
                Some(vec![
                    "dfe43d96a5e6e1b03e2e6d96aca2d45267ccc5929508587683bb45bddfae3bde" // verificationRequested event signature
                    .parse()
                    .unwrap(),
                ]),
                None,
                None,
                None,
            )
            .build();
        println!("filer has been defined");

        let event_future = web3
            .eth_filter()
            .create_logs_filter(filter)
            .then(|filter| {
                filter.unwrap().stream(time::Duration::from_secs(0)).for_each(|log| {
                    println!("got log: {:?}", log);

                    // submit signature
                    contract.call("submitSignature", (did, ), my_account, Options::default());
                    println!("signature submitted from := {} as a verifier", my_account);
                    
                    Ok(())
                })
            })
            .map_err(|_| ());
        println!("event_future has been built");

        let call_future = contract.call("requestPOR", (did,), my_account, Options::default()).then(|tx| {
            println!("got tx: {:?}", tx);
            Ok(())
        });
        println!("call_future send tx");

        event_future.join(call_future)  

    })).unwrap();   

       
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_interact() {
        let (_eloop, transport) = web3::transports::Http::new("http://localhost:8545").unwrap();
        let web3 = web3::Web3::new(transport);
        let accounts = web3.eth().accounts().wait().unwrap();

        // Accessing existing contract
        let contract_address: Address = "1e1c43a26d8dcf385201e8258b88eb233286e9c5".parse().unwrap();
        let contract = Contract::from_json(
            web3.eth(),
            contract_address,
            include_bytes!("../truffle/build/Verifier.abi"),
        )
        .unwrap();

        println!("Contract deployed to: 0x{}", contract.address()); 

        //interact with the contract
        let my_account: Address = accounts[0]; 
        let did = 4;

        let result = contract.query("queryVerifier", (my_account,), None, Options::default(), None);
        let status: bool = result.wait().unwrap();
        println!("current user status := {}", status);

        //Change state of the contract
        contract.call("addVerifier", (my_account,), my_account, Options::default());
        println!("add := {} as a verifier", my_account);

        //View changes made
        let result = contract.query("queryVerifier", (my_account,), None, Options::default(), None);
        let status: bool = result.wait().unwrap();
        println!("updated status := {}", status);

        // request POR verification
        contract.call("requestPOR", (did,), my_account, Options::default());
        println!("por is requested");
        
        // submit signature
        contract.call("submitSignature", (did, ), my_account, Options::default());
        println!("signature submitted from := {} as a verifier", my_account);

        // // add new verifier
        // contract.call("addVerifier", (accounts[1],), accounts[1], Options::default());
        // println!("add := {} as a verifier", accounts[1]);


        // // submit new signature 
        // contract.call("submitSignature", (did, ), accounts[1], Options::default());
        // println!("signature submitted from := {} as a verifier", accounts[1]);


        let result = contract.query("getInfo", (did, 1,), None, Options::default(), None);
        let status: U256 = result.wait().unwrap();
        println!("info [1] nPos := {} now", status);

        let result = contract.query("getInfo", (did, 2,), None, Options::default(), None);
        let status: U256 = result.wait().unwrap();
        println!("info [2] nNeg := {} now", status);

        let result = contract.query("getInfo", (did, 3,), None, Options::default(), None);
        let status: U256 = result.wait().unwrap();
        println!("info [3] Quorum := {} now", status);

        let result = contract.query("getInfo", (did, 4,), None, Options::default(), None);
        let status: U256 = result.wait().unwrap();
        println!("info [3] nVoter := {} now", status);

        contract.call("resolveChallenge", (did, ), my_account, Options::default());

        let result = contract.query("getInfo", (did, 1,), None, Options::default(), None);
        let status: U256 = result.wait().unwrap();
        println!("updated info [1] nPos := {} now", status);

        // let ten_millis = time::Duration::from_millis(1000);

        // thread::sleep(ten_millis);

        let result = contract.query("queryVerification", (did,), None, Options::default(), None);
        let status: bool = result.wait().unwrap();
        assert_eq!(status, true);
        println!("por verification status := {} now", status);
        
    }
}