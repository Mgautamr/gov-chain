import { ethers } from "hardhat";

async function main() {
    const GovChain = await ethers.getContractFactory("GovChain");
    const contract = await GovChain.deploy();

    await contract.waitForDeployment();

    console.log("Contract deployed to:", await contract.getAddress());
}

main();