// src/App.tsx
import {
  generateNonce,
  generateRandomness,
  jwtToAddress,
} from "@mysten/sui/zklogin";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { useEffect, useState } from "react";

const CLIENT_ID =
  "970053315715-oc830l8ubb783j1h4naafjq0ndg9prc9.apps.googleusercontent.com";
const REDIRECT_URI = "http://localhost:5173";

function App() {
  const [zkAddress, setZkAddress] = useState("");

  const startLogin = async () => {
    const keypair = new Ed25519Keypair();
    const randomness = generateRandomness();
    const nonce = generateNonce(keypair.getPublicKey(), 1000, randomness);

    sessionStorage.setItem(
      "zklogin-temp",
      JSON.stringify({
        privkey: Buffer.from(keypair.getSecretKey()).toString("hex"),
        randomness,
        nonce,
      })
    );

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.set("response_type", "id_token");
    authUrl.searchParams.set("scope", "openid email");
    authUrl.searchParams.set("nonce", nonce);
    authUrl.searchParams.set("prompt", "select_account");

    window.location.href = authUrl.toString();
  };

  const handleGoogleRedirect = () => {
    const hash = window.location.hash;
    const match = hash.match(/id_token=([^&]+)/);
    if (!match) return;

    const jwt = decodeURIComponent(match[1]);
    const temp = JSON.parse(sessionStorage.getItem("zklogin-temp") || "{}");

    if (!temp || !jwt) return;

    const salt = BigInt("123456789"); // ✅ Replace with user-specific BigInt in production
    const address = jwtToAddress(jwt, salt);
    setZkAddress(address);

    // optional: clean URL
    window.history.replaceState(null, "", window.location.pathname);
  };

  useEffect(() => {
    handleGoogleRedirect();
  }, []);

 return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#112240] rounded-xl p-8 shadow-2xl border border-[#233554] shadow-[#1E90FF]/10">
        <h1 className="text-4xl font-bold mb-8 text-[#64ffda] text-center">zkLogin with Google (Feature Branch)</h1>
        <button 
          onClick={startLogin}
          className="w-full bg-[#1E90FF] hover:bg-[#1E90FF]/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-[#1E90FF]/30 hover:shadow-[#1E90FF]/50 mb-6"
        >
          Login with Google
        </button>
        <div className="text-[#8892b0] text-center">
          <p className="mb-2">Your zkLogin Address:</p>
          <p className="font-mono text-sm break-all bg-[#1a1e2e] p-4 rounded-lg border border-[#233554] text-[#64ffda]">
            {zkAddress || "Not connected"}
          </p>
        </div>
      </div>
    </div>
  );

}

export default App;