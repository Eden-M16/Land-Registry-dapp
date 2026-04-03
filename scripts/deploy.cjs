require('dotenv').config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const adminWalletAddress = process.env.ADMIN_WALLET;
  if (!adminWalletAddress) {
    console.error("ADMIN_WALLET not found in .env file. Please set it.");
    process.exit(1);
  }
  console.log("Using ADMIN_WALLET from .env:", adminWalletAddress);

  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy(adminWalletAddress);

  await landRegistry.waitForDeployment();

  console.log("LandRegistry deployed to:", landRegistry.target);

  const contractAddressPath = path.join(__dirname, '..', 'contract-address.json');
  fs.writeFileSync(
    contractAddressPath,
    JSON.stringify({ address: landRegistry.target }, undefined, 2)
  );
  console.log("Contract address written to contract-address.json");

  const LandRegistryArtifact = hre.artifacts.readArtifactSync("LandRegistry");
  const abiPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'LandRegistry.sol', 'LandRegistry.json');
  fs.writeFileSync(
    abiPath,
    JSON.stringify(LandRegistryArtifact, null, 2)
  );
  console.log("Contract ABI written to artifacts/contracts/LandRegistry.sol/LandRegistry.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });