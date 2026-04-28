# Cloudinary Integration - Debugging Guide

## Issue Summary
Job applications are being saved to MongoDB, but Cloudinary is not receiving the files.

## Diagnostic Steps

### 1️⃣ Test Cloudinary Connection
Run the diagnostic test:
```bash
node test-cloudinary.js
```

**Expected Output:**
```
✅ All tests passed! Cloudinary is working correctly.
```

If this fails:
- Check your `.env` file has correct Cloudinary credentials
- Verify internet connection
- Check Cloudinary dashboard for API restrictions

### 2️⃣ Check Database Records
After submitting a job application, check what's saved:

**List all applications:**
```bash
GET http://localhost:5000/api/applications/debug/list
```

**Check latest application:**
```bash
GET http://localhost:5000/api/applications/debug/latest
```

Expected response should show:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "jobTitle": "Engineer",
  "resume": {
    "filename": "resume.pdf",
    "url": "https://res.cloudinary.com/...",
    "publicId": "resumes/...",
    "size": 150000
  }
}
```

### 3️⃣ Check Server Logs
When you submit an application, look for these logs in your server terminal:

```
🔄 Processing job application: { name: '...', email: '...', jobTitle: '...' }
📄 Resume info: { filename: 'resume.pdf', size: 150000, mimetype: 'application/pdf' }
⏳ Starting Cloudinary upload...
✓ Cloudinary configured with cloud_name: dpuotg7ek
📁 Uploading file: resume.pdf to folder: resumes
✓ File uploaded to Cloudinary: https://res.cloudinary.com/...
✅ Resume uploaded successfully: https://res.cloudinary.com/...
💾 Saving to MongoDB...
✅ Saved to MongoDB with ID: ...
```

**If you see errors like:**
- `❌ Cloudinary upload failed` → Check your API credentials
- `⏳ Starting Cloudinary upload... [no success message]` → Stream issue

### 4️⃣ Test with cURL

**Create a test resume file first:**
On Windows (PowerShell):
```powershell
# Create a simple resume file
@"
JOHN DOE
Email: john@example.com
Phone: 555-1234
Experience: 5 years as Software Engineer
"@ | Out-File -Encoding UTF8 test_resume.txt
```

**Then submit the form:**
```bash
curl -X POST http://localhost:5000/api/apply ^
  -F "name=John Doe" ^
  -F "email=john@example.com" ^
  -F "phone=5551234" ^
  -F "jobTitle=Software Engineer" ^
  -F "experience=5" ^
  -F "resume=@test_resume.txt"
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicationId": "...",
  "resumeUrl": "https://res.cloudinary.com/dpuotg7ek/raw/upload/v.../resumes/..."
}
```

### 5️⃣ Verify in Cloudinary Dashboard

Visit: https://cloudinary.com/console

1. Navigate to **Media Library**
2. Look for a folder named **resumes**
3. You should see uploaded files there

If the folder doesn't exist or is empty:
- Files aren't reaching Cloudinary
- Check the `resumeUrl` in your database to see if it's a valid Cloudinary URL

## Common Issues & Solutions

### Issue: Application saves but no Cloudinary URL
**Cause:** Upload function is skipped or failing silently

**Solution:**
1. Check the application response includes `resumeUrl` field
2. Look at server logs for `❌ Cloudinary upload failed`
3. Run `node test-cloudinary.js` to verify credentials

### Issue: Empty resume object in database
```json
{
  "resume": {
    "filename": "resume.pdf"
    // missing: url, publicId
  }
}
```

**Cause:** File upload failed and database saved incomplete data

**Solution:**
1. Check middleware order in server.js
2. Verify multer is correctly parsing the `resume` field
3. Look for upload errors in server logs

### Issue: Request times out during upload
**Cause:** Large file or slow connection

**Solution:**
1. Test with a small text file first (< 1MB)
2. Check internet connection
3. Increase timeout in cloudinary.js if needed:
```javascript
timeout: 120000, // 2 minutes
```

### Issue: CORS errors
**Cause:** Client can't reach the API

**Solution:**
1. Verify frontend is sending to correct URL
2. Check CORS configuration in server.js
3. Verify server is running and accessible

## Testing Checklist

- [ ] `node test-cloudinary.js` passes
- [ ] Job application submits without error (200 status)
- [ ] Response includes `resumeUrl`
- [ ] GET `/api/applications/debug/latest` shows resume URL
- [ ] URL is clickable and shows the file
- [ ] File appears in Cloudinary dashboard

## File Flow Diagram

```
User Upload Request
    ↓
Multer parses file → Buffer
    ↓
uploadToCloudinary(buffer, filename)
    ↓
Cloudinary API
    ↓
Cloudinary returns: { secure_url, public_id }
    ↓
Save to MongoDB: resume.url + resume.publicId
    ↓
Return response with resumeUrl
```

## Quick Test Commands

**Check if server is running:**
```bash
curl http://localhost:5000/api/jobs
```

**Check latest application with curl:**
```bash
curl http://localhost:5000/api/applications/debug/latest
```

**View all applications:**
```bash
curl http://localhost:5000/api/applications/debug/list
```

## Advanced Debugging

### Enable verbose logging (temporary)
Edit `utils/cloudinary.js` and add before each step:
```javascript
console.log("DEBUG: Step description");
```

### Check environment variables
```bash
node -e "require('dotenv').config(); console.log(process.env.CLOUDINARY_CLOUD_NAME)"
```

Expected output:
```
dpuotg7ek
```

### Test Cloudinary directly
```javascript
const { v2: cloudinary } = require("cloudinary");
cloudinary.config({ 
  cloud_name: "dpuotg7ek",
  api_key: "359462721422163",
  api_secret: "Q0Jn-dWGYT-QYXpl3i8py1A3emA"
});

// This will show available resources
cloudinary.api.resources({ max_results: 10 }, (err, res) => {
  console.log(err || res);
});
```

## Support Information

**Cloudinary Documentation:** https://cloudinary.com/documentation/node_integration

**Common Upload Issues:** https://support.cloudinary.com/hc/en-us/categories/202521067-Upload

If problems persist:
1. Check your Cloudinary API limits haven't been exceeded
2. Verify IP whitelist settings in Cloudinary
3. Check for firewall/proxy blocking uploads

