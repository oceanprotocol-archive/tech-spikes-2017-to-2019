// pragma solidity 0.4.24;
pragma solidity 0.5.3;

contract Verifier {
    struct Challenge{
        uint256 nPos;
        uint256 nNeg;
        uint256 quorum;
        bool    result;
        bool    finish;
        mapping(address => bool) votes;
    }

    uint256 nVoters;
    mapping(address => bool) public registry;
    mapping(uint256 => Challenge) public challenges;

    // events
    event verifierAdded(address _verifier, bool _state);
    event verifierRemoved(address _verifier, bool _state);
    event verificationRequested(uint256 _did);
    event verificationFinished(uint256 _did, bool _state);

    constructor() public {
        nVoters = 0;
    }
    
    // manage verifier registration
    function addVerifier(address user) public {
        require(user != address(0), 'address is invalid');
        if(registry[user] == true) return;
        // if not registered yet
        registry[user] = true;
         nVoters = nVoters + 1;
        emit verifierAdded(user, true);
    }

    function removeVerifier(address user) public {
        require(user != address(0), 'address is invalid');
        registry[user] = false;
        emit verifierRemoved(user, false);
    }

    function queryVerifier(address user) public view returns (bool) {
        return registry[user];
    }

    // quest por verification
    function requestPOR(uint256 did) public {
        // // if challenge of the same did exists AND it is not finished yet, do not allow new challenge
        if(challenges[did].quorum != 0 && challenges[did].finish != true) return;
        // create new challenge for the did
        challenges[did] = Challenge({
            nPos: 0,
            nNeg: 0,
            quorum: 50,
            result: false,
            finish: false
        });
        emit verificationRequested(did);
    }

    function submitSignature(uint256 did) public {
        // check eligibility
        require(registry[msg.sender] == true, 'sender is not a verifier');

        if (challenges[did].votes[msg.sender] == false){
            challenges[did].nPos = challenges[did].nPos + 1;
            challenges[did].votes[msg.sender] = true;
        }
    }

    /*
        uint256 nPos;
        uint256 nNeg;
        uint256 quorum;
        uint256 nVoters
    */
    function getInfo(uint256 did, uint256 x) public view returns(uint256) {
        if(x == 1) return challenges[did].nPos;
        if(x == 2) return challenges[did].nNeg;
        if(x == 3) return challenges[did].quorum;
        if(x == 4) return nVoters;
    }

    function resolveChallenge(uint256 did) public {
        if(challenges[did].nPos + challenges[did].nNeg == nVoters && !challenges[did].finish ) {
                challenges[did].finish = true;
                uint256 cur = challenges[did].nPos * 100;
                uint256 target = nVoters * challenges[did].quorum;
                if( cur >= target){
                    challenges[did].result = true;
                    emit verificationFinished(did, true);
                } else {
                    challenges[did].result = false;
                    emit verificationFinished(did, false);
                }
        }
    }

    function queryVerification(uint256 did) public view returns (bool){
        //require(challenges[did].finish, 'verification is not finished yet');
        return challenges[did].result;
    }
}
