pragma solidity ^0.4.25;

import 'zos-lib/contracts/Initializable.sol';
import 'openzeppelin-eth/contracts/cryptography/ECDSA.sol';
import './ServiceAgreement.sol';

/// @title On-premise compute conditions
/// @author Ocean Protocol Team
/// @notice This contract is WIP, don't use it for production
/// @dev All function calls are currently implement without side effects

contract ComputeConditions is Initializable{

    struct ProofOfUpload {
        bool exists;
        bool isValid;
        bool isLocked;
        address dataConsumer;
        bytes32 algorithmHash;
        bytes algorithmHashSignature;
    }

    ServiceAgreement private serviceAgreementStorage;
    mapping (bytes32 => ProofOfUpload) proofs;

    //events
    event HashSignatureSubmitted(bytes32 serviceAgreementId, address dataScientist, address publisher, bool state);
    event HashSubmitted(bytes32 serviceAgreementId, address dataScientist, address publisher, bool state);
    event ProofOfUploadValid(bytes32 serviceAgreementId, address dataScientist, address publisher);
    event ProofOfUploadInvalid(bytes32 serviceAgreementId, address dataScientist, address publisher);

    modifier onlyDataConsumer(bytes32 serviceAgreementId) {
        require(msg.sender == serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), 'Invalid data scientist address!');
        _;
    }

    modifier onlyComputePublisher(bytes32 serviceAgreementId) {
        require(msg.sender == serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), 'Invalid publisher address');
        _;

    }

    modifier onlyStakeholders(bytes32 serviceAgreementId) {
        require(msg.sender == serviceAgreementStorage.getAgreementPublisher(serviceAgreementId) || msg.sender == serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), 'Access denied');
        require(!proofs[serviceAgreementId].isValid, 'avoid replay attack');
        _;
    }

    function initialize(address serviceAgreementAddress) public initializer(){
        require(serviceAgreementAddress != address(0), 'invalid service agreement contract address');
        serviceAgreementStorage = ServiceAgreement(serviceAgreementAddress);
    }

    /// @notice submitHashSignature is called only by the data-scientist address.
    /// @dev At first It checks if the proof state is created or not then checks that the hash
    /// has been submitted by the publisher in order to call fulfillUpload. This preserves
    /// the message integrity and proof that both parties agree on the same algorithm file/s
    /// @param serviceAgreementId , the service level agreement Id
    /// @param signature data scientist signature = signed_hash(uploaded_algorithm_file/s)
    function submitHashSignature(bytes32 serviceAgreementId, bytes signature) public onlyDataConsumer(serviceAgreementId) returns(bool status) {
        if(proofs[serviceAgreementId].exists){
            if(proofs[serviceAgreementId].isLocked) { // avoid race conditions
                emit HashSignatureSubmitted(serviceAgreementId, serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), false);
                return false;
            }
            proofs[serviceAgreementId].isLocked = true;
            proofs[serviceAgreementId].algorithmHashSignature = signature;
            fulfillUpload(serviceAgreementId, true);
        }else{
            proofs[serviceAgreementId] = ProofOfUpload(true, false, true, serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), bytes32(0), signature);
        }
        emit HashSignatureSubmitted(serviceAgreementId, serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), true);
        proofs[serviceAgreementId].isLocked = false;
        return true;

    }

    /// @notice submitAlgorithmHash is called only by the on-premise address.
    /// @dev At first It checks if the proof state is created or not then checks if the signature
    /// has been submitted by the data scientist in order to call fulfillUpload. This preserves
    /// the message integrity and proof that both parties agree on the same algorithm file/s
    /// @param serviceAgreementId the service level agreement Id
    /// @param hash = kekccak(uploaded_algorithm_file/s)
    function submitAlgorithmHash(bytes32 serviceAgreementId, bytes32 hash) public onlyComputePublisher(serviceAgreementId) returns(bool status) {
        if(proofs[serviceAgreementId].exists){
            if(proofs[serviceAgreementId].isLocked) { // avoid race conditions
                emit HashSubmitted(serviceAgreementId, serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), false);
                return false;
            }
            proofs[serviceAgreementId].isLocked = true;
            proofs[serviceAgreementId].algorithmHash = hash;
            fulfillUpload(serviceAgreementId, true);
        }else{
            proofs[serviceAgreementId] = ProofOfUpload(true, false, true, serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), hash, new bytes(0));
        }
        emit HashSubmitted(serviceAgreementId, serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId), true);
        proofs[serviceAgreementId].isLocked = false;
        return true;
    }

    /// @notice fulfillUpload is called by anyone of the stakeholders [publisher or data scientist]
    /// @dev check if there are unfulfilled dependency condition, if false, it verifies the signature
    /// using the submitted hash (by publisher), the signature (by data scientist) then call
    /// fulfillCondition in service level agreement storage contract
    /// @param serviceAgreementId the service level agreement Id
    /// @param state get be used fo input value hash for this condition indicating the state of verification
    function fulfillUpload(bytes32 serviceAgreementId, bool state) public onlyStakeholders(serviceAgreementId) returns(bool status) {
        bytes32 condition = serviceAgreementStorage.getConditionByFingerprint(serviceAgreementId, address(this), this.fulfillUpload.selector);
        if (serviceAgreementStorage.hasUnfulfilledDependencies(serviceAgreementId, condition)){
            emit ProofOfUploadInvalid(serviceAgreementId, serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId));
            return false;
        }

        if (serviceAgreementStorage.getConditionStatus(serviceAgreementId, condition) == 1) {
            emit ProofOfUploadValid(serviceAgreementId, serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId));
            return true;
        }

        if(proofs[serviceAgreementId].dataConsumer == ECDSA.recover(ECDSA.toEthSignedMessageHash(proofs[serviceAgreementId].algorithmHash), proofs[serviceAgreementId].algorithmHashSignature)) {
            serviceAgreementStorage.fulfillCondition(serviceAgreementId, this.fulfillUpload.selector, keccak256(abi.encodePacked(state)));
            emit ProofOfUploadValid(serviceAgreementId, serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId));
            proofs[serviceAgreementId].isValid = true;
            return true;
        }
        emit ProofOfUploadInvalid(serviceAgreementId, serviceAgreementStorage.getAgreementConsumer(serviceAgreementId), serviceAgreementStorage.getAgreementPublisher(serviceAgreementId));
        return false;
    }

}
