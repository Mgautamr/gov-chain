import { useEffect, useState } from "react";
import { VerificationPage } from "./components/VerificationPage.jsx";
import { AdminLoginPage } from "./components/AdminLoginPage.jsx";
import { Header } from "./components/Header.jsx";
import { WalletPanel } from "./components/WalletPanel.jsx";
import { DocumentUploadForm } from "./components/DocumentUploadForm.jsx";
import { DocumentsPanel } from "./components/DocumentsPanel.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Topbar } from "./components/Topbar.jsx";
import crypto from "crypto";
import {
  getAdminKey,
  getDocuments,
  rejectDocument,
  setAdminKey,
  uploadDocument,
  verifyDocument
} from "./services/api.js";
import { connectWallet, getConnectedAccount, watchWalletChanges } from "./web3/wallet.js";

export default function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [adminKey, setAdminKeyState] = useState(getAdminKey());
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  async function loadDocuments() {
    if (!adminKey) {
      setDocuments([]);
      setDocumentsLoading(false);
      return;
    }

    setDocumentsLoading(true);
    setDocumentsError("");

    try {
      const response = await getDocuments();
      setDocuments(Array.isArray(response) ? response : []);
    } catch (error) {
      setDocuments([]);
      setDocumentsError(error.message);
    } finally {
      setDocumentsLoading(false);
    }
  }

  async function handleAdminLogin(submittedKey) {
    setLoginLoading(true);
    setLoginError("");

    try {
      if (submittedKey !== "govchain-admin") {
        throw new Error("Invalid admin key.");
      }

      const storedKey = setAdminKey();
      setAdminKeyState(storedKey);
      setDocumentsError("");
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("adminKey");
    setAdminKeyState("");
    setDocuments([]);
    setDocumentsError("");
    setLoginError("");
  }

  async function loadWallet() {
    try {
      const connected = await getConnectedAccount();
      setWalletAddress(connected ?? "");
      setWalletError("");
    } catch (error) {
      setWalletError(error.message);
    }
  }

  async function handleConnectWallet() {
    setWalletLoading(true);
    setWalletError("");

    try {
      const connected = await connectWallet();
      setWalletAddress(connected);
    } catch (error) {
      setWalletAddress("");
      setWalletError(error.message);
    } finally {
      setWalletLoading(false);
    }
  }

  async function handleUploadDocument(payload) {
    setUploadLoading(true);
    setUploadError("");

    try {
      await uploadDocument(payload);
      await loadDocuments();
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleAdminAction(action, id) {
    setActionLoadingId(id);
    setDocumentsError("");

    try {
      if (action === "verify") {
        await verifyDocument(id);
      } else {
        await rejectDocument(id);
      }

      await loadDocuments();
    } catch (error) {
      setDocumentsError(error.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  useEffect(() => {
    loadWallet();

    return watchWalletChanges((nextAccount) => {
      setWalletAddress(nextAccount ?? "");
      setWalletError("");
    });
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [adminKey]);

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "var(--bg)" }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)"
        }}
      />
      <div
        style={{
          position: "fixed",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(0,212,255,0.04) 0%,transparent 70%)",
          top: -200,
          left: -100,
          zIndex: 0,
          pointerEvents: "none",
          animation: "driftA 18s ease-in-out infinite alternate"
        }}
      />
      <div
        style={{
          position: "fixed",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(139,92,246,0.04) 0%,transparent 70%)",
          bottom: -150,
          right: -100,
          zIndex: 0,
          pointerEvents: "none",
          animation: "driftB 14s ease-in-out infinite alternate"
        }}
      />
      <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <Sidebar walletAddress={walletAddress} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Topbar />
          <main style={{ flex: 1, overflowY: "auto", padding: "32px 28px" }}>
            <div style={{ animation: "fadeUp 0.5s ease both" }}>
              <VerificationPage />
            </div>

            <div style={{ marginTop: 28 }}>
              <Header
                walletAddress={walletAddress}
                onConnect={handleConnectWallet}
                walletLoading={walletLoading}
                adminAuthenticated={Boolean(adminKey)}
                onLogout={handleLogout}
              />

              {!adminKey ? (
                <AdminLoginPage loading={loginLoading} error={loginError} onLogin={handleAdminLogin} />
              ) : null}

              <section
                style={{
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns: "minmax(340px, 420px) minmax(0, 1fr)",
                  marginTop: 24,
                  alignItems: "start"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <WalletPanel
                    walletAddress={walletAddress}
                    walletError={walletError}
                    onConnect={handleConnectWallet}
                    walletLoading={walletLoading}
                  />
                  <DocumentUploadForm
                    onSubmit={handleUploadDocument}
                    loading={uploadLoading}
                    error={uploadError}
                    walletAddress={walletAddress}
                  />
                </div>

                {adminKey ? (
                  <DocumentsPanel
                    documents={documents}
                    loading={documentsLoading}
                    error={documentsError}
                    onRefresh={loadDocuments}
                    onVerify={(id) => handleAdminAction("verify", id)}
                    onReject={(id) => handleAdminAction("reject", id)}
                    actionLoadingId={actionLoadingId}
                  />
                ) : (
                  <section className="glass-panel" style={{ padding: 32, textAlign: "center", color: "var(--t2)" }}>
                    Sign in as admin to access protected document review routes.
                  </section>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
