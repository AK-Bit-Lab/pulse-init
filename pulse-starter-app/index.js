import { preparePaymentRequest, LOKA_CHAIN } from "@bamzzstudio/loka-sdk";
import { createAuralisAgentManifest, AURALIS_CHAIN } from "@bamzzstudio/auralis-sdk";
import { prepareEscrowDeal, MINI_MARKET_ESCROW_MAINNET } from "@bamzzstudio/minimarket-escrow-sdk";
import { formatTokenUnits, CFRG_MINT_AMOUNT_DISPLAY, getExplorerAddressUrl } from "@bamzzstudio/cforge-sdk";

const NETWORK = process.env.CELO_NETWORK || "mainnet";

async function runPulseStarterApp() {
  console.log("Pulse starter app using real SDK integration");
  console.log(`Network: ${NETWORK}`);

  const lokaChain = LOKA_CHAIN[NETWORK] ?? LOKA_CHAIN.mainnet;
  console.log(`Loka chain: ${lokaChain.name} (chainId: ${lokaChain.id})`);

  try {
    const payment = preparePaymentRequest({
      amount: "5.00",
      tokenSymbol: "USDm",
      note: "Starter app payment",
      merchant: "0x0000000000000000000000000000000000000001",
    });
    console.log(`LocalPay invoice: ${payment.draft.invoiceId}`);
  } catch (error) {
    console.warn("LocalPay call failed:", error?.message || error);
  }

  const auralisChain = AURALIS_CHAIN[NETWORK] ?? AURALIS_CHAIN.mainnet;
  console.log(`Auralis chain: ${auralisChain.name} (chainId: ${auralisChain.id})`);

  try {
    const manifest = createAuralisAgentManifest({ appUrl: "https://auralis.example.com" });
    console.log(`Auralis agent type: ${manifest.type}, endpoints: ${manifest.endpoints.length}`);
  } catch (error) {
    console.warn("Auralis call failed:", error?.message || error);
  }

  console.log(`MiniMarket escrow contract: ${MINI_MARKET_ESCROW_MAINNET.address}`);

  try {
    const deal = prepareEscrowDeal({
      buyer: "0x0000000000000000000000000000000000000002",
      seller: "0x0000000000000000000000000000000000000003",
      label: "Starter test deal",
      amount: "12.50",
      symbol: "USDC",
    });
    console.log(`MiniMarket deal hash: ${deal.draft.dealHash}`);
  } catch (error) {
    console.warn("MiniMarket call failed:", error?.message || error);
  }

  try {
    console.log(`CFRG mint amount: ${CFRG_MINT_AMOUNT_DISPLAY}`);
    const formatted = formatTokenUnits(500n * 10n ** 18n);
    console.log(`C-forge formatted units: ${formatted}`);
    console.log(`Explorer: ${getExplorerAddressUrl("0x0000000000000000000000000000000000000001")}`);
  } catch (error) {
    console.warn("C-forge call failed:", error?.message || error);
  }

  console.log("\nPulse starter app integration complete.");
}

runPulseStarterApp().catch(error => {
  console.error("Pulse starter app failed:", error?.message || error);
  process.exitCode = 1;
});
