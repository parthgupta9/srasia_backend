require('dotenv').config();
const mongoose = require('mongoose');
const JobApplication = require('./models/Job');

async function checkApplications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const apps = await JobApplication.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log(`📋 Found ${apps.length} applications\n`);
    
    apps.forEach((app, i) => {
      console.log(`${i + 1}. ${app.name} - ${app.jobTitle}`);
      console.log(`   Email: ${app.email}`);
      console.log(`   Resume object:`, app.resume);
      
      if (app.resume && app.resume.url) {
        console.log(`   ✅ HAS CLOUDINARY URL: ${app.resume.url}`);
      } else {
        console.log(`   ❌ NO CLOUDINARY URL - Resume data:`, JSON.stringify(app.resume, null, 2));
      }
      console.log('');
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkApplications();
