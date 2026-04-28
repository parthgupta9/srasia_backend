# Cloudinary Integration Guide

## Overview
This project now integrates Cloudinary for secure, cloud-based storage of resume files. Instead of storing files as buffers in MongoDB, resumes are uploaded to Cloudinary and only the secure URL is stored in the database.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `cloudinary`: Cloud storage SDK
- `streamifier`: For streaming file uploads to Cloudinary

### 2. Environment Variables
Ensure your `.env` file contains the following Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=dpuotg7ek
CLOUDINARY_API_KEY=359462721422163
CLOUDINARY_API_SECRET=Q0Jn-dWGYT-QYXpl3i8py1A3emA
CLOUDINARY_URL=cloudinary://359462721422163:Q0Jn-dWGYT-QYXpl3i8py1A3emA@dpuotg7ek
```

### 3. Project Structure
- **`utils/cloudinary.js`**: Cloudinary configuration and upload/delete utilities
- **`models/Job.js`**: Updated schema to store URL and publicId instead of file buffer
- **`controller/JobController.js`**: Updated to upload resumes to Cloudinary
- **`middleware/upload.js`**: Multer configuration (unchanged, still uses memory storage)

## How It Works

### Resume Upload Flow
1. User submits job application with resume file
2. File is received by the server as a buffer (via multer memory storage)
3. Buffer is streamed to Cloudinary
4. Cloudinary returns:
   - `secure_url`: HTTPS URL to access the file
   - `public_id`: Unique identifier for managing the file
5. Only the URL and public_id are stored in MongoDB (not the file itself)
6. Resume link is included in the confirmation email

### Database Schema
The resume field in JobApplication model now stores:
```javascript
resume: {
  filename: String,        // Original file name
  url: String,             // Cloudinary secure URL
  publicId: String,        // For deleting from Cloudinary
  size: Number,            // File size in bytes
  uploadedAt: Date         // Upload timestamp
}
```

## API Endpoints

### Apply for Job
**POST** `/api/jobs/apply`

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Fields:
  - `name` (required): Applicant name
  - `email` (required): Applicant email
  - `phone`: Phone number
  - `previousOrganization`: Previous work organization
  - `institutionName`: Educational institution
  - `highestQualification`: Qualification level
  - `experience`: Years of experience
  - `expectedCtc`: Expected salary
  - `jobTitle` (required): Position applying for
  - `resume` (required): PDF/DOC file (multipart file)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Application submitted successfully"
}
```

**Response Error (400/500):**
```json
{
  "error": "Error message"
}
```

## Features

### ✅ Benefits of Cloudinary Integration
- **Secure Storage**: Files stored in Cloudinary's secure cloud
- **Reduced Database Size**: No large buffers in MongoDB
- **High Availability**: Cloudinary provides CDN for fast delivery
- **Easy Management**: Public IDs allow easy deletion when needed
- **Scalability**: No server storage limits
- **Backup**: Cloudinary provides automatic backups

### 📧 Email Integration
- Resume links in confirmation emails (clickable HTTPS URLs)
- No file attachments needed (links included in HTML email)
- Reduced email size

## Error Handling

### Common Issues and Solutions

**1. Cloudinary Upload Fails**
- Verify credentials in `.env` file
- Check file size (ensure it's under Cloudinary limits)
- Verify network connectivity

**2. Missing Resume File**
- Ensure `resume` field is included in the request
- Check file is properly multipart-encoded

**3. Invalid Credentials**
- Copy credentials exactly from Cloudinary dashboard
- No typos in cloud name, API key, or secret

## Usage Example

### cURL Request
```bash
curl -X POST http://localhost:5000/api/jobs/apply \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=1234567890" \
  -F "jobTitle=Software Engineer" \
  -F "experience=5" \
  -F "highestQualification=B.Tech" \
  -F "resume=@/path/to/resume.pdf"
```

### JavaScript Fetch
```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('phone', '1234567890');
formData.append('jobTitle', 'Software Engineer');
formData.append('experience', '5');
formData.append('resume', fileInput.files[0]);

const response = await fetch('/api/jobs/apply', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

## File Management

### Retrieving Resume URL
Access the resume URL from the database:
```javascript
const application = await JobApplication.findById(applicationId);
const resumeUrl = application.resume.url; // HTTPS URL from Cloudinary
```

### Deleting a Resume
Use the public_id to remove from Cloudinary:
```javascript
const { deleteFromCloudinary } = require('../utils/cloudinary');
await deleteFromCloudinary(application.resume.publicId);
```

## Security Considerations

1. **Credentials**: Never commit `.env` file to version control
2. **Public IDs**: Keep public IDs secret if restricting access
3. **File Validation**: Implement file type checking for PDFs/DOCs
4. **Rate Limiting**: Consider adding rate limiting to prevent spam

## Monitoring

Monitor Cloudinary usage at: https://cloudinary.com/console

Check:
- Storage usage
- Bandwidth usage
- Request metrics
- Failed uploads

## Troubleshooting

### Check Logs
Enable debug logging in `utils/cloudinary.js` to troubleshoot issues.

### Test Upload
```javascript
const { uploadToCloudinary } = require('./utils/cloudinary');
const buffer = Buffer.from('test');
await uploadToCloudinary(buffer, 'test.pdf', 'resumes');
```

## Next Steps

1. Test the job application endpoint
2. Verify resumes appear in Cloudinary dashboard
3. Confirm email links work correctly
4. Set up Cloudinary upload presets if needed
5. Configure transformations for resume previews

## Support
For Cloudinary documentation: https://cloudinary.com/documentation
