const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying LandRegistry...");
  
  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  
  // For Hardhat 2, use deployed() instead of waitForDeployment()
  await landRegistry.deployed();
  
  const address = landRegistry.address;
  console.log("✅ LandRegistry deployed to:", address);
  
  // Save contract address
  const fs = require("fs");
  const config = {
    contractAddress: address,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync("contract-address.json", JSON.stringify(config, null, 2));
  console.log("💾 Address saved to contract-address.json");
  
  // Optional: Register a sample land
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n📝 Registering a sample land...");
  
  const mintTx = await landRegistry.mintLand(
    deployer.address,
    "123 Blockchain Street, Metaverse City",
    500,
    "QmSampleHash123456",
    "PAR001"
  );
  await mintTx.wait();
  
  console.log("✅ Sample land registered! Token ID: 1");
  
  // Get land details
  const land = await landRegistry.getLandDetails(1);
  console.log("\n📋 Land Details:");
  console.log("  Owner:", land.owner);
  console.log("  Location:", land.location);
  console.log("  Area:", land.area.toString(), "sq meters");
  console.log("  Parcel ID:", land.parcelId);
  console.log("  Verified:", land.isVerified);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});