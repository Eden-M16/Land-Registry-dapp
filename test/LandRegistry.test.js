const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry", function () {
    let landRegistry;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const LandRegistry = await ethers.getContractFactory("LandRegistry");
        landRegistry = await LandRegistry.deploy(owner.address);
        await landRegistry.waitForDeployment();
    });

    it("Deployer should be registrar", async function () {
        const isRegistrar = await landRegistry.isRegistrar(owner.address);
        expect(isRegistrar).to.equal(true);
    });

    it("Other wallets cannot register land", async function () {
        await expect(
            landRegistry.connect(addr1).registerLand(addr1.address, "123 Main St", 1000, "PAR-001", "uri")
        ).to.be.revertedWith("Only registrar can call");
    });

    it("Registrar can register land", async function () {
        const tokenId = await landRegistry.registerLand(owner.address, "123 Main St", 1000, "PAR-001", "uri");
        const land = await landRegistry.getLandDetails(1);
        expect(land.owner).to.equal(owner.address);
    });
});