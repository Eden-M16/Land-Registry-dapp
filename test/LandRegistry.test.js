const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry", function () {
  let landRegistry;
  let owner, addr1, addr2;
  
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();
    await landRegistry.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const isRegistrar = await landRegistry.isRegistrar(owner.address);
      expect(isRegistrar).to.equal(true);
    });
    
    it("Should have the correct name and symbol", async function () {
      expect(await landRegistry.name()).to.equal("LandChain");
      expect(await landRegistry.symbol()).to.equal("LAND");
    });
  });
  
  describe("Land Registration", function () {
    it("Should register a new land", async function () {
      const tokenURI = "https://example.com/land/1";
      
      await landRegistry.registerLand(
        addr1.address,
        "123 Main St",
        1000,
        "PAR-001",
        tokenURI
      );
      
      const land = await landRegistry.getLandDetails(1);
      expect(land.location).to.equal("123 Main St");
      expect(land.area).to.equal(1000);
      expect(land.owner).to.equal(addr1.address);
    });
    
    it("Should fail if not registrar", async function () {
      const tokenURI = "https://example.com/land/1";
      
      await expect(
        landRegistry.connect(addr1).registerLand(
          addr2.address,
          "123 Main St",
          1000,
          "PAR-001",
          tokenURI
        )
      ).to.be.revertedWith("AccessControl");
    });
  });
  
  describe("Marketplace", function () {
    beforeEach(async function () {
      const tokenURI = "https://example.com/land/1";
      await landRegistry.registerLand(
        addr1.address,
        "123 Main St",
        1000,
        "PAR-001",
        tokenURI
      );
    });
    
    it("Should list land for sale", async function () {
      const price = ethers.parseEther("10");
      await landRegistry.connect(addr1).listForSale(1, price);
      
      const land = await landRegistry.getLandDetails(1);
      expect(land.isListed).to.equal(true);
      expect(land.listedPrice).to.equal(price);
    });
    
    it("Should buy listed land", async function () {
      const price = ethers.parseEther("10");
      await landRegistry.connect(addr1).listForSale(1, price);
      
      await landRegistry.connect(addr2).buyLand(1, { value: price });
      
      const land = await landRegistry.getLandDetails(1);
      expect(land.owner).to.equal(addr2.address);
      expect(land.isListed).to.equal(false);
    });
  });
});