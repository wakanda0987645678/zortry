const hre = require("hardhat");

async function main() {
  console.log("Deploying YoubuidlChannelsRegistry to Base Mainnet...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  const YoubuidlChannelsRegistry = await hre.ethers.getContractFactory("YoubuidlChannelsRegistry");
  const registry = await YoubuidlChannelsRegistry.deploy();
  
  await registry.waitForDeployment();
  
  const address = await registry.getAddress();
  
  console.log("\n✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", address);
  console.log("🔗 View on Basescan:", `https://basescan.org/address/${address}`);
  console.log("\n📝 Next steps:");
  console.log("1. Add to Replit Secrets:");
  console.log(`   REGISTRY_CONTRACT_ADDRESS=${address}`);
  console.log("2. Verify contract (optional):");
  console.log(`   npx hardhat verify --network base ${address}`);
  console.log("\n3. Set PLATFORM_PRIVATE_KEY in Replit Secrets for batch registration");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
