import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Required for multer to handle form-data
  },
};

// Multer storage configuration
const upload = multer({ dest: "/tmp" });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  upload.single("file")(req, res, async (err) => {
    if (err) return res.status(500).json({ error: "File upload error" });

    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);

    try {
      const formData = new FormData();
      formData.append("file", fileStream, path.basename(filePath));

      const pinataRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer YOUR_PINATA_JWT_TOKEN`, // Replace with Pinata JWT token
        },
      });

      fs.unlinkSync(filePath); // Remove temp file

      return res.status(200).json({ ipfsHash: pinataRes.data.IpfsHash });
    } catch (error) {
      return res.status(500).json({ error: "IPFS upload failed" });
    }
  });
}
