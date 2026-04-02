const hre = require("hardhat");

async function main() {
  console.log("Deploying LandRegistry contract...");
  
  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  
  await landRegistry.waitForDeployment();
  
  const contractAddress = await landRegistry.getAddress();
  console.log(`LandRegistry deployed to: ${contractAddress}`);
  
  // Save contract address to a file
  const fs = require("fs");
  const contractAddressFile = "contract-address.json";
  fs.writeFileSync(contractAddressFile, JSON.stringify({
    address: contractAddress,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  console.log(`Contract address saved to ${contractAddressFile}`);
  
  // Get the deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log("Deployer has DEFAULT_ADMIN_ROLE and REGISTRAR_ROLE");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});