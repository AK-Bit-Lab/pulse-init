import { preparePaymentRequest, LOKA_AGENT_NAME, LOKA_CHAIN } from "@bamzzstudio/loka-sdk";
import { createAuralisAgentManifest, AURALIS_AGENT_NAME, AURALIS_CHAIN } from "@bamzzstudio/auralis-sdk";
import { prepareEscrowDeal, MINI_MARKET_AGENT_NAME, MINI_CHAIN, MINI_MARKET_ESCROW_MAINNET } from "@bamzzstudio/minimarket-escrow-sdk";
import {
  formatTokenUnits,
  getExplorerAddressUrl,
  CFRG_MINT_AMOUNT_DISPLAY,
  WEB_CELO_MINT_FEE_DISPLAY,
} from "@bamzzstudio/cforge-sdk";

const NETWORK = process.env.CELO_NETWORK || "mainnet";

function toLogValue(value) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, (_, item) => (typeof item === "bigint" ? item.toString() : item));
  } catch {
    return String(value);
  }
}

async function runPulseGrowthBot() {
  console.log("Pulse Growth Bot active");
  console.log(`Network: ${NETWORK}`);
  let successfulCalls = 0;

  console.log("\nVerifying LocalPay SDK (Loka)...");
  try {
    const chain = LOKA_CHAIN[NETWORK] ?? LOKA_CHAIN.mainnet;
    console.log(`Loka chain: ${chain.name} (chainId: ${chain.id})`);
    console.log(`Agent: ${LOKA_AGENT_NAME}`);
    const result = preparePaymentRequest({
      amount: "10.00",
      tokenSymbol: "USDm",
      note: "Market vendor payment",
      merchant: "0x0000000000000000000000000000000000000001",
      customer: "pulse-bot-tester",
    });
    console.log(`Payment request action: ${result.agent.action}`);
    console.log(`Invoice ID: ${result.draft.invoiceId}`);
    successfulCalls += 1;
  } catch (error) {
    console.warn("LocalPay SDK call failed:", error?.message || error);
  }

  console.log("\nVerifying Auralis SDK...");
  try {
    const chain = AURALIS_CHAIN[NETWORK] ?? AURALIS_CHAIN.mainnet;
    console.log(`Auralis chain: ${chain.name} (chainId: ${chain.id})`);
    console.log(`Agent: ${AURALIS_AGENT_NAME}`);
    const manifest = createAuralisAgentManifest({ appUrl: "https://auralis.example.com" });
    console.log(`Auralis manifest type: ${manifest.type}`);
    console.log(`Auralis endpoints: ${manifest.endpoints.length}`);
    successfulCalls += 1;
  } catch (error) {
    console.warn("Auralis SDK call failed:", error?.message || error);
  }

  console.log("\nVerifying MiniMarket Escrow SDK...");
  try {
    const chain = MINI_CHAIN[NETWORK] ?? MINI_CHAIN.mainnet;
    console.log(`MiniMarket chain: ${chain.name} (chainId: ${chain.id})`);
    console.log(`Agent: ${MINI_MARKET_AGENT_NAME}`);
    console.log(`Escrow contract: ${MINI_MARKET_ESCROW_MAINNET.address}`);
    const deal = prepareEscrowDeal({
      buyer: "0x0000000000000000000000000000000000000002",
      seller: "0x0000000000000000000000000000000000000003",
      label: "Pulse market test deal",
      amount: "25.00",
      symbol: "USDm",
    });
    console.log(`Escrow action: ${deal.agent.action}`);
    console.log(`Deal hash: ${deal.draft.dealHash}`);
    successfulCalls += 1;
  } catch (error) {
    console.warn("MiniMarket Escrow SDK call failed:", error?.message || error);
  }

  console.log("\nVerifying C-forge SDK...");
  try {
    console.log(`CFRG mint amount: ${CFRG_MINT_AMOUNT_DISPLAY} CFRG`);
    console.log(`Web mint fee: ${WEB_CELO_MINT_FEE_DISPLAY} CELO`);
    const formatted = formatTokenUnits(1_000n * 10n ** 18n);
    console.log(`Formatted token units: ${formatted}`);
    const explorerUrl = getExplorerAddressUrl("0x0000000000000000000000000000000000000001");
    console.log(`Explorer URL: ${explorerUrl}`);
    successfulCalls += 1;
  } catch (error) {
    console.warn("C-forge SDK call failed:", error?.message || error);
  }

  if (successfulCalls === 0) {
    throw new Error("No live SDK calls succeeded.");
  }

  console.log(`\nSDK integration check completed. ${successfulCalls}/4 SDKs verified.`);
}

runPulseGrowthBot().catch(error => {
  console.error("Pulse Growth Bot failed:", error?.message || error);
  process.exitCode = 1;
});
