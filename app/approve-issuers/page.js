'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from "../utils/constants";
import { getAdminAuthStatus } from '../utils/getCookies';
import toast, { Toaster } from 'react-hot-toast';
import { FiCheck, FiX, FiLogOut, FiUserCheck, FiUserX } from 'react-icons/fi';

export default function ApproveIssuers() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [unapprovedIssuers, setUnapprovedIssuers] = useState([]);
    const [approvedIssuers, setApprovedIssuers] = useState([]);
    const [loading, setLoading] = useState({
        approve: {},
        remove: {},
        global: false
    });
    const [userAddress, setUserAddress] = useState(null);

    useEffect(() => {
        async function checkAuth() {
            const authStatus = await getAdminAuthStatus();
            setIsAuthenticated(authStatus);
        }
        checkAuth();
        fetchIssuers();
        getUserAddress();
    }, []);

    async function fetchIssuers() {
        if (!window.ethereum) {
            toast.error("Please install MetaMask");
            return;
        }

        setLoading(prev => ({ ...prev, global: true }));
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            const registeredIssuers = await contract.getRegisteredIssuers();
            const unapproved = registeredIssuers.filter(issuer => !issuer.isApproved);
            const approved = registeredIssuers.filter(issuer => issuer.isApproved);

            setUnapprovedIssuers(unapproved);
            setApprovedIssuers(approved);
        } catch (error) {
            console.error('Error fetching issuers:', error);
            toast.error('Failed to fetch issuers');
        } finally {
            setLoading(prev => ({ ...prev, global: false }));
        }
    }

    async function getUserAddress() {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setUserAddress(await signer.getAddress());
    }

    async function approveIssuer(walletAddress) {
        if (!window.ethereum) return;
        setLoading(prev => ({ ...prev, approve: { ...prev.approve, [walletAddress]: true } }));

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            const tx = await contract.approveIssuer(walletAddress);
            await tx.wait();
            toast.success('Issuer approved successfully!');
            await fetchIssuers();
        } catch (error) {
            console.error('Error approving issuer:', error);
            toast.error('Approval failed!');
        } finally {
            setLoading(prev => ({ ...prev, approve: { ...prev.approve, [walletAddress]: false } }));
        }
    }

    async function removeIssuer(walletAddress) {
        if (!window.ethereum) return;
        setLoading(prev => ({ ...prev, remove: { ...prev.remove, [walletAddress]: true } }));

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            const tx = await contract.removeIssuer(walletAddress);
            await tx.wait();
            toast.success('Issuer removed successfully!');
            await fetchIssuers();
        } catch (error) {
            console.error('Error removing issuer:', error);
            toast.error('Removal failed!');
        } finally {
            setLoading(prev => ({ ...prev, remove: { ...prev.remove, [walletAddress]: false } }));
        }
    }

    if (isAuthenticated === null) {
        return (
            <div className="flex h-96 justify-center items-center py-24"  style={{ minHeight:"500px" }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    const IssuerCard = ({ issuer, isApproved }) => (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="mb-2 sm:mb-0 w-full sm:w-auto">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{issuer.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{issuer.institution}</p>
                <p className="text-xs text-gray-500 break-all mt-1">{issuer.wallet}</p>
            </div>
            <div className="flex space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
                {isApproved ? (
                    <span className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                        <FiUserCheck className="mr-1" /> Approved
                    </span>
                ) : (
                    <button
                        onClick={() => approveIssuer(issuer.wallet)}
                        disabled={loading.approve[issuer.wallet]}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center ${
                            loading.approve[issuer.wallet]
                                ? 'bg-green-300 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        {loading.approve[issuer.wallet] ? (
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <FiCheck className="mr-1" />
                        )}
                        Approve
                    </button>
                )}
                <button
                    onClick={() => removeIssuer(issuer.wallet)}
                    disabled={loading.remove[issuer.wallet]}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center ${
                        loading.remove[issuer.wallet]
                            ? 'bg-red-300 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                >
                    {loading.remove[issuer.wallet] ? (
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <FiX className="mr-1" />
                    )}
                    Remove
                </button>
            </div>
        </div>
    );

    return (
        <div className="relative flex items-center w-9/12 justify-center h-96 p-4" style={{ minHeight:"500px" }}>
        <div className="absolute bottom-0  bg-gradient-to-b from-blue-50 to-white w-full h-3/6 z-10"></div>
  
        <div className="sm:w-auto border-2 border-blue-900 z-20 w-full mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-sm sm:shadow-md overflow-hidden relative">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Issuer Management</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Review and manage issuer applications</p>
                </div>
                <form action="/api/admin-logout" method="POST" className="w-full sm:w-auto">
                    <button
                        type="submit"
                        className="flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm sm:text-base"
                    >
                        <FiLogOut className="mr-2" /> Logout
                    </button>
                </form>
            </div>

            {loading.global ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="mb-8 sm:mb-10">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                            <FiUserX className="mr-2 text-orange-500" /> Pending Approval
                        </h3>
                        {unapprovedIssuers.length === 0 ? (
                            <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                                <p className="text-sm sm:text-base text-gray-500">No pending issuers found.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {unapprovedIssuers.map((issuer, index) => (
                                    <IssuerCard key={`unapproved-${index}`} issuer={issuer} isApproved={false} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                            <FiUserCheck className="mr-2 text-green-500" /> Approved Issuers
                        </h3>
                        {approvedIssuers.length === 0 ? (
                            <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                                <p className="text-sm sm:text-base text-gray-500">No approved issuers yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {approvedIssuers.map((issuer, index) => (
                                    <IssuerCard key={`approved-${index}`} issuer={issuer} isApproved={true} />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
        </div>
    );
}   

function LoginForm() {
    return (
        <div className="relative flex items-center w-9/12 justify-center h-96 p-4" style={{ minHeight:"500px" }}>
        <div className="absolute bottom-0  bg-gradient-to-b from-blue-50 to-white w-full h-3/6 z-10"></div>
  
        <div className="sm:min-w-3xl border-2 border-blue-900 z-20 w-full mx-auto mt-8 sm:mt-10 p-4 sm:p-6 bg-white rounded-lg shadow-sm sm:shadow-md max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center">
                <FiLogOut className="mr-2" /> Admin Login
            </h2>
            <form action="/api/admin-login" method="POST">
                <div className="mb-3 sm:mb-4">
                    <label htmlFor="password" className="block mb-1 sm:mb-2 text-sm sm:text-base font-medium text-gray-700">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm sm:text-base"
                >
                    Login
                </button>
            </form>
        </div>
        </div>
    );
}
