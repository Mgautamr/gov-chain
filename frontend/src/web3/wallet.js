import { BrowserProvider, Contract } from "ethers";
import { GOV_CHAIN_CONTRACT } from "./contract.js";

function getEthereum() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed. Please install it to use Web3 features.");
  }

  return window.ethereum;
}

function getReadableError(error) {
  return error?.shortMessage || error?.reason || error?.message || "Web3 request failed.";
}

async function createProvider() {
  return new BrowserProvider(getEthereum());
}

export async function getConnectedAccount() {
  const provider = await createProvider();
  const accounts = await provider.send("eth_accounts", []);
  return accounts[0] ?? null;
}

export async function connectWallet() {
  const provider = await createProvider();
  const accounts = await provider.send("eth_requestAccounts", []);

  if (!accounts[0]) {
    throw new Error("No wallet account was returned by MetaMask.");
  }

  return accounts[0];
}

export function watchWalletChanges(onAccountChange) {
  if (typeof window === "undefined" || !window.ethereum) {
    return () => {};
  }

  const handleAccountsChanged = (accounts) => {
    onAccountChange(accounts[0] ?? "");
  };

  window.ethereum.on("accountsChanged", handleAccountsChanged);

  return () => {
    window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
  };
}

export async function storeDataOnChain(data) {
  try {
    const provider = await createProvider();
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    if (Number(network.chainId) !== GOV_CHAIN_CONTRACT.chainId) {
      throw new Error(
        `Wrong network selected. Switch MetaMask to chain ID ${GOV_CHAIN_CONTRACT.chainId}.`
      );
    }

    const contract = new Contract(GOV_CHAIN_CONTRACT.address, GOV_CHAIN_CONTRACT.abi, signer);
    const tx = await contract.storeRecord(data);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    throw new Error(getReadableError(error));
  }
}
