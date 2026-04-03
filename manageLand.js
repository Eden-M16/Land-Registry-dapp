// manageLand.js
const hre = require("hardhat");

async function main() {
  const fs = require("fs");

  // 1️⃣ Load deployed contract address
  const { address: contractAddress } = JSON.parse(fs.readFileSync("contract-address.json"));
  console.log("Contract address:", contractAddress);

  // 2️⃣ Set up your wallet and provider
  const provider = new hre.ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/7W7OsgY_5XbUpbe0I62B4"); 
  const deployer = new hre.ethers.Wallet("bf2797b9a5a087d6fdc28fe7c2e26b438bd83b579cd9ded09d314805034c7bd8", provider); 
  console.log("Using wallet:", deployer.address);

  // 3️⃣ Attach the LandRegistry contract
  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.attach(contractAddress).connect(deployer);
  console.log("Contract attached successfully!");

  // 4️⃣ Check if your wallet is a registrar
  const isRegistrar = await landRegistry.isRegistrar(deployer.address);
  console.log("Is this wallet registrar?", isRegistrar);

  if (!isRegistrar) {
    console.log("❌ You are not a registrar. Cannot register lands.");
    return;
  }

  // 5️⃣ Example: Register a new land
  const newLand = {
    owner: deployer.address,
    location: "123 Main St",
    area: 1000,
    parcelId: "PAR-001",
    tokenURI: "https://example.com/land/1"
  };

  const tx = await landRegistry.registerLand(
    newLand.owner,
    newLand.location,
    newLand.area,
    newLand.parcelId,
    newLand.tokenURI
  );

  const receipt = await tx.wait();
  console.log("✅ Land registered!", receipt.events[0].args);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});