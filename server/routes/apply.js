const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Employer = require('../models/Employer'); // Assume exists
const { sendToEmployer } = require('../utils/notifications');

router.post('/apply', async (req, res) => {
  const { jobId, formData, cvFile } = req.body;
  const job = await Job.findById(jobId);
  // Simulate AI matching (e.g., compare keywords)
  const userKeywords = Object.values(formData).join(' ') + ' ' + cvFile; // Simplified
  const jobKeywords = job.requirements;
  const matchPercentage = calculateMatch(userKeywords, jobKeywords); // Implement calculateMatch function

  if (matchPercentage < 50) {
    return res.status(400).json({ error: 'Application denied', percentage: matchPercentage });
  }
  // Send to employer (e.g., email or save to DB)
  await sendToEmployer(job.employerId, formData, cvFile);
  res.json({ success: true, percentage: matchPercentage });
});

// Helper function (simplified)
function calculateMatch(user, job) {
  // Basic keyword matching; replace with AI model
  const userWords = user.split(' ');
  const jobWords = job.split(' ');
  const matches = userWords.filter(word => jobWords.includes(word)).length;
  return (matches / jobWords.length) * 100;
}

module.exports = router;