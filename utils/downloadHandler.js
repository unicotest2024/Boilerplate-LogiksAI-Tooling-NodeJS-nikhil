import fs from "fs";
import path from "path";
import { verifyDownloadToken } from "./downloadToken.js";
import { getFileById } from "../models/fileModel.js";

/**
 * Handles secure file download logic.
 * @param {string} token - Signed download token
 * @param {object} res - Express response (used for res.download)
 */
export async function handleSecureDownload(token, res) {
  try {
    const secret = process.env.DOWNLOAD_TOKEN_SECRET;
    if (!secret) {
      console.error("DOWNLOAD_TOKEN_SECRET missing in environment.");
      return res.status(500).json({ success: false, error: "Server misconfigured" });
    }

    console.log("🔹 Incoming download request with token:", token);

    // 1. Verify token → get payload
    let payload;
    try {
      payload = verifyDownloadToken(secret, token);
      console.log("Token verified. Payload:", payload);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(400).json({ success: false, error: err.message });
    }

    const { id: fileId, bucket } = payload;

    // 2. Fetch file metadata
    const fileRecord = await getFileById(fileId, bucket);
    if (!fileRecord) {
      console.error("File metadata not found for ID:", fileId);
      return res.status(404).json({ success: false, error: "File not found" });
    }

    console.log("File record found:", {
      file_name: fileRecord.file_name,
      relative_path: fileRecord.relative_path,
      storage_type: fileRecord.storage_type,
    });

    if (fileRecord.blocked === "true") {
      console.warn("File is marked as expired:", fileRecord.file_name);
      return res.status(403).json({ success: false, error: "File is expired" });
    }

    // 3. Verify file existence
    const filePath = path.join(process.cwd(), fileRecord.relative_path);
    if (!fs.existsSync(filePath)) {
      console.error("File not found on disk:", filePath);
      return res.status(404).json({ success: false, error: "File missing on server" });
    }

    const stat = fs.statSync(filePath);
    console.log(`File exists at ${filePath} with size: ${stat.size} bytes (${(stat.size / 1024).toFixed(2)} KB)`);

    // 4. Stream file safely (instead of res.download)
    const fileName = fileRecord.file_name;

    // Set correct headers manually
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Cache-Control", "no-transform"); // prevent proxy/middleware alteration
    res.removeHeader("Transfer-Encoding");

    console.log("Starting file stream...");

    // Create readable stream and pipe it to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Track total bytes streamed
    let bytesSent = 0;
    fileStream.on("data", (chunk) => {
      bytesSent += chunk.length;
    });

    // Handle stream errors
    fileStream.on("error", (err) => {
      console.error("Error streaming file:", err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: "Failed to download file" });
      } else {
        res.end();
      }
    });

    // When done streaming
    fileStream.on("end", () => {
      console.log(`File download complete: ${fileName}`);
      console.log(`Bytes sent: ${bytesSent} bytes (${(bytesSent / 1024).toFixed(2)} KB)`);
      console.log(`Original file size: ${stat.size} bytes (${(stat.size / 1024).toFixed(2)} KB)`);

      if (bytesSent !== stat.size) {
        console.warn("WARNING: Streamed bytes do not match file size!");
      } else {
        console.log("File streamed successfully with matching size.");
      }
    });

  } catch (err) {
    console.error("Unexpected error in download handler:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
