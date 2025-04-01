"use client";
import { useState } from "react";
import { contractABI, contractAddress } from "../utils/constants";
import { uploadToIPFS } from "../utils/uploadToIPFS";
import { QRCodeCanvas } from "qrcode.react";
import { ethers } from "ethers";
import toast, { Toaster } from 'react-hot-toast';

const IssueCertificate = () => {
  const [recipient, setRecipient] = useState("");
  const [course, setCourse] = useState("");
  const [file, setFile] = useState(null);
  const [certificateHash, setCertificateHash] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleIssue = async () => {
    if (!recipient || !course || !file) {
      toast.error("All fields are required!");
      return;
    }

    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Processing certificate...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const isRegistered = await contract.isIssuerApproved(walletAddress);
      if (!isRegistered) {
        toast.error("You are not an approved issuer!");
        setIsLoading(false);
        return;
      }

      toast.loading("Uploading to IPFS...", { id: loadingToast });
      const ipfsUrl = await uploadToIPFS(file);
      if (!ipfsUrl) {
        toast.error("IPFS upload failed!", { id: loadingToast });
        return;
      }

      const certHash = ethers.keccak256(ethers.toUtf8Bytes(ipfsUrl));

      toast.loading("Issuing certificate on blockchain...", { id: loadingToast });
      const tx = await contract.issueCertificate(recipient, course, certHash);
      await tx.wait();
      
      setCertificateHash(certHash);
      toast.success("Certificate issued successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error: ${error.message}`, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md overflow-hidden">
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Issue Certificate</h2>
        <p className="text-gray-600">Fill in the details to issue a new certificate</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter recipient name"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter course name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certificate File
          </label>
          <div className="flex items-center">
            <label className="flex flex-col items-center px-4 py-2 bg-white rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-700">
                {fileName || "Choose file"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {fileName && (
              <button
                onClick={() => {
                  setFile(null);
                  setFileName("");
                }}
                className="ml-2 p-2 text-red-500 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleIssue}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } flex items-center justify-center`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Issue Certificate"
          )}
        </button>
      </div>

      {certificateHash && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Certificate Issued Successfully!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Certificate Hash: <span className="font-mono break-all text-xs">{certificateHash}</span>
          </p>
          
          <div className="flex flex-col items-center">
            <h5 className="text-md font-medium text-gray-700 mb-2">Scan QR to Verify</h5>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <QRCodeCanvas 
                value={`${window.location.origin}/verify?hash=${certificateHash}`} 
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="mt-3 text-sm text-gray-500">Share this QR code for easy verification</p>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/verify?hash=${certificateHash}`);
                toast.success("Verification link copied!");
              }}
              className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Verification Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCertificate;