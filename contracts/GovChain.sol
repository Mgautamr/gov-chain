// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GovChain {

    // 🔹 Store registered users
    mapping(address => bool) public users;

    // 🔹 Store document hashes
    mapping(string => bool) public documents;

    // 🔹 Event logs (very useful for frontend & debugging)
    event UserRegistered(address user);
    event DocumentAdded(string hash, address addedBy);

    // ✅ Register a user
    function registerUser() public {
        require(!users[msg.sender], "User already registered");
        users[msg.sender] = true;

        emit UserRegistered(msg.sender);
    }

    // ✅ Add document hash
    function addDocument(string memory hash) public {
        require(users[msg.sender], "User not registered");
        require(!documents[hash], "Document already exists");

        documents[hash] = true;

        emit DocumentAdded(hash, msg.sender);
    }

    // ✅ Verify document
    function verifyDocument(string memory hash) public view returns (bool) {
        return documents[hash];
    }
}