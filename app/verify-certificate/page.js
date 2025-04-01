"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense , useCallback} from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";
import { uploadToIPFS } from "../utils/uploadToIPFS";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import toast, { Toaster } from 'react-hot-toast';
import { FiCamera, FiUpload, FiCheck, FiX, FiHash, FiImage, FiExternalLink } from 'react-icons/fi';

const VerifyCertificate = () => {
  const searchParams = useSearchParams();
  const certificateHashFromUrl = searchParams.get("hash");
  const [certificateHash, setCertificateHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [certificateDetails, setCertificateDetails] = useState(null);
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState("hash");

  useEffect(() => {
    if (certificateHashFromUrl) {
      setCertificateHash(certificateHashFromUrl);
      setVerificationMethod("hash");
      // Automatically verify if hash is present in URL
      verifyCertificate(certificateHashFromUrl);
    }
  }, [certificateHashFromUrl]);

  useEffect(() => {
    // Reset hash when changing verification method (except when coming from URL)
    if (!certificateHashFromUrl) {
      setCertificateHash("");
    }
    setIsValid(null);
    setCertificateDetails(null);
  }, [verificationMethod, certificateHashFromUrl]);

  const fetchCertificateDetails  = useCallback(async (hash) => {
    if (!window.ethereum) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const certificate = await contract.certificates(hash);
      
      setCertificateDetails({
        recipientName: certificate.recipientName,
        courseName: certificate.courseName,
        issueDate: new Date(Number(certificate.issueDate) * 1000).toLocaleDateString(),
        ipfsUrl: certificate.ipfsUrl || null
      });
    } catch (error) {
      console.error("Error fetching certificate details:", error);
    }
  }, []);

  const verifyCertificate = useCallback(async (hash = certificateHash) => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      return;
    }
    if (!hash) {
      toast.error("Please enter a certificate hash");
      return;
    }

    setLoading(true);
    setIsValid(null);
    setCertificateDetails(null); 
    const loadingToast = toast.loading("Verifying certificate...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      
      // Verify certificate
      const result = await contract.verifyCertificate(hash);
      setIsValid(result);
      
      // Fetch certificate details if valid
      if (result) {
        await fetchCertificateDetails(hash);
      }
      
      toast[result ? "success" : "error"](
        result ? " Certificate is valid!" : " Invalid Certificate",
        { id: loadingToast }
      );
    } catch (error) {
      console.error(error);
      setIsValid(false);
      toast.error("Verification failed. See console for details.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  }, [certificateHash, fetchCertificateDetails]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
     if (!uploadedFile) {
    setCertificateHash(""); 
    return;
  }

    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setLoading(true);
    const loadingToast = toast.loading("Processing certificate file...");

      try {
        const ipfsUrl = await uploadToIPFS(uploadedFile);
        if (!ipfsUrl) throw new Error("IPFS Upload Failed");

        const certHash = ethers.keccak256(ethers.toUtf8Bytes(ipfsUrl));
        setCertificateHash(certHash);
        toast.success("File processed successfully!", { id: loadingToast });
        await verifyCertificate(certHash);
      } catch (error) {
        console.error(error);
        setIsValid(false);
        toast.error("Failed to process file. See console for details.", { id: loadingToast });
      } finally {
        setLoading(false);
      }
    };

  const captureQR = () => {
    setScanning(true);
    setVerificationMethod("qr");
  };

  useEffect(() => {
    if (!scanning || verificationMethod !== "qr") return;

    const interval = setInterval(() => {
      if (!webcamRef.current) return;
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const qrCode = jsQR(imageData.data, img.width, img.height);

        if (qrCode) {
          setCertificateHash(qrCode.data);
          setScanning(false);
          toast.success("QR Code scanned successfully!");
          clearInterval(interval);
          verifyCertificate(qrCode.data);
        }
      };
    }, 1000);

    return () => clearInterval(interval);
  }, [scanning, verificationMethod, verifyCertificate]);

  const verificationMethods = [
    { id: "hash", name: "Enter Hash", icon: <FiHash className="mr-2" /> },
    { id: "qr", name: "Scan QR Code", icon: <FiCamera className="mr-2" /> },
    { id: "file", name: "Upload File", icon: <FiUpload className="mr-2" /> },
  ];

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md overflow-hidden">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Verify Certificate</h2>
        <p className="text-gray-600">Choose a method to verify your certificate</p>
      </div>

      <div className="flex justify-center space-x-2 mb-6">
        {verificationMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setVerificationMethod(method.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
              verificationMethod === method.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {method.icon}
            {method.name}
          </button>
        ))}
      </div>

      {verificationMethod === "hash" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Hash
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter certificate hash"
              value={certificateHash}
              onChange={(e) => setCertificateHash(e.target.value)}
            />
          </div>
          <button
            onClick={() => verifyCertificate()}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify Certificate"}
          </button>
        </div>
      )}

      {verificationMethod === "qr" && (
        <div className="space-y-4">
          {scanning ? (
            <>
              <div className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setScanning(false)}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Cancel Scanning
              </button>
            </>
          ) : (
            <>
              <div className="p-8 bg-gray-100 rounded-lg text-center">
                <FiCamera className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">Click below to scan QR code</p>
              </div>
              <button
                onClick={captureQR}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
              >
                <FiCamera className="mr-2" />
                Scan QR Code
              </button>
            </>
          )}
        </div>
      )}

      {verificationMethod === "file" && (
        <div className="space-y-4">
          <div className="flex items-center">
            <label className="flex flex-col items-center px-4 py-6 bg-gray-50 rounded-md border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 w-full">
              <FiUpload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                {fileName || "Click to upload certificate file"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
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
                <FiX className="h-5 w-5" />
              </button>
            )}
          </div>
          {fileName && !loading && (
            <button
              onClick={() => verifyCertificate()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Verify Certificate
            </button>
          )}
        </div>
      )}

      {isValid !== null && (
        <div className="mt-6 space-y-4">
          <div className={`p-4 rounded-md ${
            isValid ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            <div className="flex items-center">
              {isValid ? (
                <FiCheck className="h-6 w-6 text-green-500 mr-2" />
              ) : (
                <FiX className="h-6 w-6 text-red-500 mr-2" />
              )}
              <span className="font-medium">
                {isValid ? "Certificate is valid!" : "Certificate is invalid"}
              </span>
            </div>
            {certificateHash && (
              <div className="mt-2 text-xs break-all bg-white/50 p-2 rounded">
                <span className="font-medium">Hash:</span> {certificateHash}
              </div>
            )}
          </div>

          {isValid && certificateDetails && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2">Certificate Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Recipient:</span> {certificateDetails.recipientName}</p>
                <p><span className="font-medium">Course:</span> {certificateDetails.courseName}</p>
                <p><span className="font-medium">Issued Date:</span> {certificateDetails.issueDate}</p>
                
                {certificateDetails.ipfsUrl && (
                  <div className="mt-4">
                    <a
                      href={certificateDetails.ipfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      <FiImage className="mr-2" />
                      View Certificate Image
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </Suspense> 
  );
};

export default VerifyCertificate;