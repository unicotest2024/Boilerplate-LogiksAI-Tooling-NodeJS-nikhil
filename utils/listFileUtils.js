// utils/listBucketUtils.js
import fs from "fs";
import path from "path";

/**
 * List only files from a given bucket path (local storage).
 * Returns name, size, and last modified timestamp for each file.
 */
export async function listLocalBucket(bucket, filepath = "") {
  try {
    const dirPath = path.join(process.cwd(), "buckets", bucket, filepath);

    if (!fs.existsSync(dirPath)) {
      return { status: "error", message: `Path not found: ${dirPath}` };
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const files = [];

    for (const item of items) {
      if (item.isFile()) {
        const fullPath = path.join(dirPath, item.name);
        const stats = fs.statSync(fullPath);

        files.push({
          name: item.name,
          size: stats.size,
          modified: stats.mtime,
        });
      }
    }

    return {
      status: "success",
      bucket,
      filepath,
      files,
    };
  } catch (err) {
    console.error("Error listing local bucket:", err);
    return { status: "error", message: err.message };
  }
}
