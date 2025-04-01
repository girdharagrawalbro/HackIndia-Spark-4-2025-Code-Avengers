"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";
import toast from 'react-hot-toast';

const minDeposit = "0.01"; // Minimum deposit in ETH (update accordingly)

export default function RegisterIssuer() {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const registerIssuer = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");

    setLoading(true);
    setStatus("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Convert deposit to Wei
      const deposit = ethers.parseEther(minDeposit);

      const tx = await contract.registerIssuer(name, institution, { value: deposit });
      await tx.wait();


      setStatus("✅ Successfully registered as an issuer!");
      toast.success("Successfully registered as an issuer!");
    } catch (error) {
      console.error(error);
      toast.error(error);
      setStatus("❌ Registration failed");
      toast.error("❌ Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md overflow-hidden space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Register as Issuer</h2>
        <p className="text-gray-600 mt-1">Please provide your details to register</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
            Institution Name
          </label>
          <input
            id="institution"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="University of Blockchain"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
        </div>
      </div>

      <button
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${loading
          ? "bg-blue-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
          }`}
        onClick={registerIssuer}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Register (Deposit ${minDeposit} ETH)`
        )}
      </button>

      {status && (
        <div
          className={`p-3 rounded-md text-center ${status.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
        >
          {status}
        </div>
      )}
    </div>
  );
}