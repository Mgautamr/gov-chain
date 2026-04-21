import contractMetadata from "../contracts/govChain.json";

export const GOV_CHAIN_CONTRACT = {
  address: contractMetadata.address,
  chainId: Number(contractMetadata.chainId),
  abi: contractMetadata.abi
};
