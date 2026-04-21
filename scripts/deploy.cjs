const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting ChessEscrow Deployment on Base Sepolia...");

  // official Base Sepolia USDC address
  const USDC_ADDRESS = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
  
  const ORACLE_ADDRESS = process.env.ORACLE_ADDRESS;
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;

  if (!ORACLE_ADDRESS || !TREASURY_ADDRESS) {
    throw new Error("❌ Error: ORACLE_ADDRESS and TREASURY_ADDRESS must be set in your .env file");
  }

  console.log("🛠️  Config:");
  console.log("   - USDC:", USDC_ADDRESS);
  console.log("   - Oracle (Backend):", ORACLE_ADDRESS);
  console.log("   - Treasury (Fees):", TREASURY_ADDRESS);

  const ChessEscrow = await hre.ethers.getContractFactory("ChessEscrow");
  const escrow = await ChessEscrow.deploy(USDC_ADDRESS, ORACLE_ADDRESS, TREASURY_ADDRESS);

  // await escrow.deployed(); // older ethers version syntax
  // await escrow.waitForDeployment(); // newer ethers version syntax
  
  console.log("⏳ Waiting for deployment...");
  // In Hardhat 6, the deploy call returns the contract once it's sent.
  // We'll use the target property which works across versions for logging.
  console.log(`✅ ChessEscrow deployed to: ${escrow.target || escrow.address}`);

  console.log("\n📜 Next Steps:");
  console.log(`1. Update your Supabase Secrets with the new contract address.`);
  console.log(`2. Verify the contract on Basescan:`);
  console.log(`   npx hardhat verify --network base-sepolia ${escrow.target || escrow.address} "${USDC_ADDRESS}" "${ORACLE_ADDRESS}" "${TREASURY_ADDRESS}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
