import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Connect to local blockchain (Hardhat)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// 🔹 Use your deployed account private key
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 🔹 Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// 🔹 Contract ABI (only needed functions)
const ABI = [
  "function registerUser() public",
  "function addDocument(string memory hash) public",
  "function verifyDocument(string memory hash) public view returns (bool)"
];

// 🔹 Connect contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// =========================
// ✅ ROUTES
// =========================

// 🔹 Home route (test)
app.get("/", (req, res) => {
  res.send("GovChain Backend Running 🚀");
});

// 🔹 Register User (POST)
app.post("/register", async (req, res) => {
  try {
    const tx = await contract.registerUser();
    await tx.wait();

    res.send("✅ User Registered Successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error: " + err.reason || err.message);
  }
});

// 🔹 Register User (GET - for browser testing)
app.get("/register", async (req, res) => {
  try {
    const tx = await contract.registerUser();
    await tx.wait();

    res.send("✅ User Registered (GET)");
  } catch (err) {
    res.send("❌ Error: " + (err.reason || err.message));
  }
});

// 🔹 Add Document
app.post("/add-document", async (req, res) => {
  try {
    const { hash } = req.body;

    if (!hash) {
      return res.status(400).send("❌ Hash is required");
    }

    const tx = await contract.addDocument(hash);
    await tx.wait();

    res.send("✅ Document Added Successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error: " + (err.reason || err.message));
  }
});

// 🔹 Verify Document
app.get("/verify/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    const result = await contract.verifyDocument(hash);

    res.send(result.toString()); // "true" or "false"
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error: " + err.message);
  }
});

// =========================
// 🚀 START SERVER
// =========================
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});