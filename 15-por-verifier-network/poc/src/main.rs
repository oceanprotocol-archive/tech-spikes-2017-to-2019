extern crate rustc_hex;
extern crate tokio_core; 
extern crate web3;

use std::time;
use web3::contract::{Contract, Options};
use web3::types::{Address, U256 };
use web3::futures::{Future, Stream};
use web3::types::FilterBuilder;


fn main() {
    // create event loop to monitor the events from contract
    let mut eloop = tokio_core::reactor::Core::new().unwrap();
    let web3 = web3::Web3::new(web3::transports::Http::with_event_loop("http://localhost:8545", &eloop.handle(), 1).unwrap());

    eloop.run(web3.eth().accounts().then(|accounts| {
        // import accounts
        let accounts = accounts.unwrap();
        println!("accounts: {:?}", &accounts);

        // Accessing existing contract
        let contract_address: Address = "7a32993de449327bbad29683a28bf336fed1e7e6".parse().unwrap();
        let contract = Contract::from_json(
            web3.eth(),
            contract_address,
            include_bytes!("../truffle/build/Verifier.abi"),
        )
        .unwrap();
        println!("contract deployed at: {}", contract.address());

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
                    Ok(())
                })
            })
            .map_err(|_| ());
        println!("event_future has been built");

        let call_future = contract.call("requestPOR", (2,), accounts[0], Options::default()).then(|tx| {
            println!("got tx: {:?}", tx);
            Ok(())
        });
        println!("call_future send tx");

        event_future.join(call_future)

    })).unwrap();          
}