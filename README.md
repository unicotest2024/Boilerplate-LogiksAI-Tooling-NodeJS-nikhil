# Simple README

This project provides a Node.js based file storage API with support for creating buckets, uploading files, generating secure download URLs, and listing directories or files. The storage currently supports **local filesystem**.

## Features

* Create a local bucket
* Upload files (attachment or base64 content)
* Generate short-lived secure download URLs
* Stream downloads through token-based verification
* List folders inside a bucket
* List files inside a bucket path

## Tech Stack

* Node.js + Express
* Multer (file uploads)
* Joi (validation)
* JSON-based token system for secure downloads
* Cron job for auto-deleting expired files

## Folder Structure

```
buckets/            # All storage buckets
cron/               # Expired file cleanup
models/             # DB models
utils/              # Bucket utils (upload, create, list, download)
routes/             # Download route for token-based file streaming
server/             # REST server logic
```

## API Endpoints

### 1. Create Bucket

```
POST /run?tool=storage_bucket&message=create_bucket&storage_type=local&bucket_name=mybucket
```

### 2. Upload File

Attachment mode uses form-data:

```
POST /run?tool=storage_bucket&message=upload_file&storage_type=local&bucket=mybucket&filename=test.pdf&mimetype=application/pdf&mode=attachment
```

Content mode (base64):

```
POST /run?tool=storage_bucket&message=upload_file&storage_type=local&bucket=mybucket&filename=note.txt&mode=content
Body: { "file": "<base64>" }
```

### 3. Generate Download URL

```
POST /run?tool=storage_bucket&message=download_file&storage_type=local&fileId=123&bucket=mybucket
```

Response contains:

```
/download/<token>
```

### 4. Actual File Download

```
GET /download/:token
```

Handled by `downloadRouter`.

### 5. List Files

```
POST /run?tool=storage_bucket&message=list_files&storage_type=local&bucket=mybucket
```

### 6. List Folders

```
POST /run?tool=storage_bucket&message=list_dir&storage_type=local&bucket=mybucket
```

## Environment Variables

```
REST_PORT=8000
DOWNLOAD_TOKEN_SECRET=yoursecret
BASE_DOWNLOAD_URL=http://localhost:8000
DOWNLOAD_TOKEN_EXPIRY=600
```

## Start Server

```
npm install
node server.js or 
npm run dev
```

## Notes

* All buckets are created under `/buckets` root
* Download tokens expire automatically
* Cron job removes expired or blocked files
* S3, OneDrive, Google Drive are placeholders for future expansion
