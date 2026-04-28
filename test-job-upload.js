#!/usr/bin/env node
/**
 * Test Job Application Upload
 * This script simulates a real job application with resume file
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

console.log("🧪 Testing Job Application Upload");
console.log("==================================\n");

const testResumeContent = `
JOHN DOE
john.doe@example.com | +1 (555) 123-4567

OBJECTIVE
Seeking a challenging software engineering position to leverage expertise in full-stack development.

EXPERIENCE
Senior Software Engineer | Tech Corp | Jan 2020 - Present
- Led development of microservices architecture
- Improved application performance by 40%

Software Engineer | StartUp Inc | Jun 2018 - Dec 2019
- Built full-stack web applications using Node.js and React
- Mentored junior developers

EDUCATION
B.Tech in Computer Science | State University | 2018

SKILLS
- Node.js, Express, MongoDB
- React, JavaScript, HTML/CSS
- AWS, Docker, CI/CD pipelines
`;

// Create a temporary test resume file
const testResumePath = path.join(__dirname, 'test-resume.txt');
fs.writeFileSync(testResumePath, testResumeContent);
console.log("✅ Created test resume file");

// Prepare the form data
const form = new FormData();
form.append('name', 'John Doe');
form.append('email', 'john.doe@example.com');
form.append('phone', '5551234567');
form.append('jobTitle', 'Senior Software Engineer');
form.append('highestQualification', 'B.Tech');
form.append('experience', '6');
form.append('expectedCtc', '1500000');
form.append('previousOrganization', 'Tech Corp');
form.append('institutionName', 'State University');
form.append('resume', fs.createReadStream(testResumePath));

console.log("\n📤 Sending request to: http://localhost:5000/api/apply");
console.log("Form data prepared with resume file\n");

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/apply',
  method: 'POST',
  headers: form.getHeaders(),
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log("\nResponse:");
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log("\n✅ Application submitted successfully!");
        if (parsed.resumeUrl) {
          console.log(`📄 Resume URL: ${parsed.resumeUrl}`);
        }
      } else {
        console.log("\n❌ Application failed");
        if (parsed.details) {
          console.log(`Details: ${parsed.details}`);
        }
      }
    } catch (e) {
      console.log(data);
    }

    // Cleanup
    fs.unlinkSync(testResumePath);
    console.log("\n✅ Cleanup completed");
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error("❌ Request failed:", error.message);
  console.error("\nMake sure the server is running on port 5000");
  fs.unlinkSync(testResumePath);
  process.exit(1);
});

form.pipe(req);
