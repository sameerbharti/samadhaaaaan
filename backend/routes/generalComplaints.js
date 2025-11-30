const express = require('express');
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all complaints for general view (sorted by net likes)
// @route   GET /api/general-complaints
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get all complaints with user info, sorted by net likes (likes - dislikes) and then by creation date
    let complaints = await Complaint.find({})
      .populate('userId', 'name email')

    // Sort by net likes (likes - dislikes) descending, then by creation date descending
    complaints = complaints.sort((a, b) => {
      const netA = a.likes.length - a.dislikes.length;
      const netB = b.likes.length - b.dislikes.length;

      // If net votes are different, sort by net votes descending
      if (netB !== netA) return netB - netA;

      // If net votes are the same, sort by creation date descending
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;