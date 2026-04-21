import { create } from "ipfs-http-client";

// Infura-backed IPFS endpoints may require an Authorization header from the caller.
// TODO: add Infura auth if needed
const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });

export default ipfs;
