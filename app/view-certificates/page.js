"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";
import { FiFileText, FiLoader, FiCalendar, FiUser, FiAward, FiExternalLink, FiTrash2 } from "react-icons/fi";
import toast, { Toaster } from 'react-hot-toast';

export default function IssuerDashboard() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState({
    refresh: false,
    withdraw: false,
    revoke: {}
  });
  const [issuerAddress, setIssuerAddress] = useState("");

  useEffect(() => {
    fetchIssuedCertificates();
  }, []);

  const fetchIssuedCertificates = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      setLoading(prev => ({ ...prev, refresh: false }));
      return;
    }

    setLoading(prev => ({ ...prev, refresh: true }));
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setIssuerAddress(address);

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const certificateHashes = await contract.getCertificatesByIssuer(address);

      const certificateData = await Promise.all(
        certificateHashes.map(async (hash) => {
          const certificate = await contract.certificates(hash);
          return {
            hash,
            recipientName: certificate.recipientName,
            courseName: certificate.courseName,
            issueDate: new Date(Number(certificate.issueDate) * 1000).toLocaleDateString(),
            isValid: certificate.isValid,
            ipfsUrl: certificate.ipfsUrl || "#"
          };
        })
      );

      setCertificates(certificateData);
      toast.success(`Found ${certificateData.length} certificates`);
    } catch (error) {
      console.error("Error fetching certificates", error);
      toast.error("Failed to fetch certificates");
    } finally {
      setLoading(prev => ({ ...prev, refresh: false }));
    }
  };

  const revokeCertificate = async (certificateHash) => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      return;
    }

    setLoading(prev => ({ ...prev, revoke: { ...prev.revoke, [certificateHash]: true } }));
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.revokeCertificate(certificateHash);
      await tx.wait();
      toast.success("Certificate revoked successfully!");
      await fetchIssuedCertificates();
    } catch (error) {
      console.error("Error revoking certificate:", error);
      toast.error(error.reason || "Failed to revoke certificate");
    } finally {
      setLoading(prev => ({ ...prev, revoke: { ...prev.revoke, [certificateHash]: false } }));
    }
  };

  const withdrawDeposit = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      return;
    }

    setLoading(prev => ({ ...prev, withdraw: true }));
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.withdrawDeposit();
      await tx.wait();
      toast.success("Deposit withdrawn successfully!");
    } catch (error) {
      console.error("Error withdrawing deposit:", error);
      toast.error(error.reason || "Withdrawal failed");
    } finally {
      setLoading(prev => ({ ...prev, withdraw: false }));
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(issuerAddress);
    toast.success("Address copied to clipboard!");
  };

  return (
    <div className="sm:w-auto w-full mx-auto p-4 sm:p-6">
      <Toaster position="top-center" />

      {/* Header Section */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <FiFileText className="mr-2 sm:mr-3 text-blue-600" />
            Certificates Issued
          </h1>
          {issuerAddress && (
            <p className="text-gray-600 mt-2 text-sm sm:text-base flex items-center">
              Issuer:
              <span
                className="ml-2 font-mono text-xs sm:text-sm bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                onClick={copyAddress}
                title="Click to copy"
              >
                {issuerAddress.slice(0, 6)}...{issuerAddress.slice(-4)}
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchIssuedCertificates}
            disabled={loading.refresh}
            className="flex-1 sm:flex-none px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
          >
            {loading.refresh ? (
              <FiLoader className="animate-spin mr-2" />
            ) : (
              <FiLoader className="mr-2" />
            )}
            Refresh
          </button>
          <button
            onClick={withdrawDeposit}
            disabled={loading.withdraw}
            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 text-sm sm:text-base rounded-md flex items-center justify-center ${loading.withdraw
                ? 'bg-yellow-400 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
          >
            {loading.withdraw ? (
              <FiLoader className="animate-spin mr-2" />
            ) : (
              <FiExternalLink className="mr-2" />
            )}
            Withdraw
          </button>
        </div>
      </div>

      {/* Content Section */}
      {loading.refresh ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiFileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No certificates issued yet</h3>
          <p className="mt-1 text-sm sm:text-base text-gray-500">Certificates you issue will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {certificates.map((certificate, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="p-4 sm:p-5 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 flex items-center truncate">
                      <FiAward className="mr-2 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{certificate.courseName}</span>
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 flex items-center truncate">
                      <FiUser className="mr-2 flex-shrink-0" />
                      <span className="truncate">{certificate.recipientName}</span>
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${certificate.isValid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {certificate.isValid ? "Valid" : "Invalid"}
                  </span>
                </div>

                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <FiCalendar className="mr-2 flex-shrink-0" />
                    Issued: {certificate.issueDate}
                  </p>

                  <div className="mt-3 sm:mt-4 flex space-x-2">
                    <a
                      href={`/verify-certificate?hash=${certificate.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1 sm:py-1.5 px-2 sm:px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs sm:text-sm font-medium flex items-center justify-center"
                    >
                      <FiExternalLink className="mr-1 sm:mr-2" />
                      Verify
                    </a>
                    {certificate.isValid && (
                      <button
                        onClick={() => revokeCertificate(certificate.hash)}
                        disabled={loading.revoke[certificate.hash]}
                        className={`flex-1 py-1 sm:py-1.5 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium flex items-center justify-center ${loading.revoke[certificate.hash]
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                      >
                        {loading.revoke[certificate.hash] ? (
                          <FiLoader className="animate-spin mr-1 sm:mr-2" />
                        ) : (
                          <FiTrash2 className="mr-1 sm:mr-2" />
                        )}
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}