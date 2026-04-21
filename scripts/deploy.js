const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function writeContractMetadata(metadata) {
  const destinations = [
    path.join(__dirname, "..", "backend", "src", "contracts", "govChain.json"),
    path.join(__dirname, "..", "frontend", "src", "contracts", "govChain.json")
  ];

  for (const destination of destinations) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(metadata, null, 2));
  }
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const GovChain = await hre.ethers.getContractFactory("GovChain");
  const contract = await GovChain.deploy(deployer.address);

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const artifact = await hre.artifacts.readArtifact("GovChain");
  const network = await hre.ethers.provider.getNetwork();

  const metadata = {
    contractName: artifact.contractName,
    address,
    chainId: Number(network.chainId),
    network: hre.network.name,
    abi: artifact.abi
  };

  await writeContractMetadata(metadata);

  console.log(`GovChain deployed to ${address} on ${hre.network.name}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
