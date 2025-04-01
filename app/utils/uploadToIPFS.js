import axios from "axios";

const PINATA_API_KEY = "e116fc6eb4e1cf65ff34  ";
const PINATA_SECRET_API_KEY = "c32069e906511dd8ba0d65e6bb10f7be32afa90a5f2e17bd316bd2d56b4ce10e"
export const uploadToIPFS = async (data) => {
  try {
    const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: data,
      },
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error("IPFS Upload Failed", error);
    return null;
  }
};