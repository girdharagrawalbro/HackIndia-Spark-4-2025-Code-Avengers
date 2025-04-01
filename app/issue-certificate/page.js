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

      const uniqueId = Date.now(); // Unique timestamp
    const certHash = ethers.keccak256(ethers.toUtf8Bytes(ipfsUrl + uniqueId));


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
    <div className="relative flex items-center w-9/12 justify-center p-4" style={{ minHeight: "500px" }}>
    <div className="absolute bottom-0 bg-gradient-to-b from-blue-50 to-white w-full h-3/6 z-10"></div>
  
    <div className="max-w-md border-2 border-blue-900 mx-auto p-6 bg-white rounded-xl shadow-md z-20 overflow-hidden w-full">
      {!certificateHash ? (
        <div className="animate-fadeIn">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Issue Certificate</h2>
            <p className="text-gray-600">Fill in the details to issue a new certificate</p>
          </div>
  
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter recipient name"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course name"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate File <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <label className="flex flex-1 items-center justify-between px-4 py-3 bg-white rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className={`text-sm truncate max-w-xs ${fileName ? "font-medium text-gray-800" : "text-gray-500"}`}>
                    {fileName || "Choose PDF or image file..."}
                  </span>
                  <div className="ml-2 p-1 bg-gray-100 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    required
                  />
                </label>
                {fileName && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setFileName("");
                    }}
                    className="ml-2 p-2 text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">Supported formats: PDF, PNG, JPG (max 5MB)</p>
            </div>
  
            <div className="pt-2">
              <button
                onClick={handleIssue}
                disabled={isLoading || !recipient.trim() || !course.trim() || !fileName}
                className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : (!recipient.trim() || !course.trim() || !fileName)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
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
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Certificate Issued Successfully!</h3>
            <p className="text-gray-600 mb-4">You can now share this certificate with the recipient.</p>
            
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <h4 className="font-medium text-gray-700">Recipient:</h4>
                  <p className="text-gray-900">{recipient}</p>
                  
                  <h4 className="font-medium text-gray-700 mt-2">Course:</h4>
                  <p className="text-gray-900">{course}</p>
                  
                  <h4 className="font-medium text-gray-700 mt-2">Certificate ID:</h4>
                  <p className="font-mono text-sm break-all text-gray-600">{certificateHash}</p>
                </div>
                
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <QRCodeCanvas 
                    value={`${window.location.origin}/verify-certificate?hash=${certificateHash}`} 
                    size={120}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
            </div>
  
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/verify-certificate?hash=${certificateHash}`);
                  toast.success("Verification link copied to clipboard!");
                }}
                className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Link
              </button>
              
              <button
                onClick={() => {
                  setCertificateHash("");
                  setRecipient("");
                  setCourse("");
                  setFileName("");
                  setFile(null);
                }}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Issue Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>

  );
};

export default IssueCertificate;
