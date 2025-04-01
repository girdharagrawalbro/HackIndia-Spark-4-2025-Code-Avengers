import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const getContract = () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  }
  return null;
};
