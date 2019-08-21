pragma solidity 0.4.25;

contract AttributeStore {
    mapping(bytes32 => uint) store;

    function getAttribute(bytes32 _UUID, string _attrName)
    internal view returns (uint) {
        bytes32 key = keccak256(abi.encodePacked(_UUID, _attrName));
        return store[key];
    }

    function setAttribute(bytes32 _UUID, string _attrName, uint _attrVal)
    internal {
        bytes32 key = keccak256(abi.encodePacked(_UUID, _attrName));
        store[key] = _attrVal;
    }
}
