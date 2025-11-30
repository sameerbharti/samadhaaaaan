const express = require('express');
const { body, validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { sendNotification, sendRoleBasedNotification } = require('../utils/notifications');

const router = express.Router();

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
router.post('/', protect, [
  body('title', 'Title is required').notEmpty(),
  body('description', 'Description is required').notEmpty(),
  body('category', 'Category is required').isIn([
    'street-light',
    'water-pipe',
    'rain-drainage',
    'road-reconstruction',
    'garbage-system',
    'other'
  ]),
  body('priority').optional().isIn(['low', 'medium', 'high'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, priority, location, images } = req.body;

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      location,
      images,
      userId: req.user.id
    });

    await complaint.save();

    // Populate user data for response
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('userId', 'name email phone')
      .populate('assignedUser', 'name email')

    // Send notification to admin
    const io = req.app.get('io');
    if (io) {
      sendRoleBasedNotification(io, 'admin', {
        title: 'New Complaint Received',
        message: `A new complaint "${title}" has been submitted by ${req.user.name}`,
        type: 'info',
        complaintId: complaint._id
      });
    }

    res.status(201).json({
      success: true,
      complaint: populatedComplaint
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all complaints (admin) or user's complaints
// @route   GET /api/complaints
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let complaints;
    
    // If user is admin, return all complaints
    if (req.user.role === 'admin') {
      complaints = await Complaint.find({})
        .populate('userId', 'name email')
        .populate('assignedUser', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // If user is a regular user, return only their complaints
      complaints = await Complaint.find({ userId: req.user.id })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    }

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

// @desc    Get user's complaints
// @route   GET /api/complaints/mine
// @access  Private
router.get('/mine', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id })
      .populate('userId', 'name email')
      .populate('assignedUser', 'name email')
      .sort({ createdAt: -1 });

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

// @desc    Get a specific complaint
// @route   GET /api/complaints/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('assignedUser', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user is authorized to view this complaint
    if (req.user.role !== 'admin' &&
        complaint.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update a complaint
// @route   PUT /api/complaints/:id
// @access  Private
router.put('/:id', protect, [
  body('status').optional().isIn([
    'pending', 'in-progress', 'resolved', 'rejected'
  ])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' &&
        complaint.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get the original status before update to check for changes
    const originalStatus = complaint.status;

    // Only admin can update status and other admin fields
    if (req.user.role === 'admin') {
      const { status, estimatedResolutionDate } = req.body;

      if (status) complaint.status = status;
      if (estimatedResolutionDate) complaint.estimatedResolutionDate = estimatedResolutionDate;

      // If status is resolved, set resolution date
      if (status === 'resolved' && !complaint.resolutionDate) {
        complaint.resolutionDate = Date.now();
      }
    }

    // Only users can update their own complaint details (title, description, category, priority)
    if (complaint.userId.toString() === req.user.id.toString() && req.user.role !== 'admin') {
      const { title, description, category, priority } = req.body;

      if (title) complaint.title = title;
      if (description) complaint.description = description;
      if (category) complaint.category = category;
      if (priority) complaint.priority = priority;
    }

    await complaint.save();

    // Populate user data for response
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('userId', 'name email phone')
      .populate('assignedUser', 'name email')

    // Send notifications based on status changes
    const io = req.app.get('io');
    if (io) {
      // Send notification to the user when status changes
      if (originalStatus !== complaint.status) {
        // Find the user who submitted the complaint
        const user = await User.findById(complaint.userId);

        if (user) {
          sendNotification(io, `${user._id.toString()}_room`, {
            title: 'Complaint Status Updated',
            message: `Your complaint "${complaint.title}" status has been updated to ${complaint.status}`,
            type: 'info',
            complaintId: complaint._id
          });
        }

        // Send notification to admin
        sendRoleBasedNotification(io, 'admin', {
          title: 'Complaint Status Updated',
          message: `Complaint "${complaint.title}" status has been updated to ${complaint.status}`,
          type: 'info',
          complaintId: complaint._id
        });
      }

    }

    res.json({
      success: true,
      complaint: populatedComplaint
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Only admin can delete complaints
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await complaint.remove();

    res.json({
      success: true,
      message: 'Complaint removed'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add feedback to a complaint
// @route   PUT /api/complaints/:id/feedback
// @access  Private
router.put('/:id/feedback', protect, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Only the user who created the complaint can add feedback
    if (complaint.userId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only allow feedback for resolved or closed complaints
    if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
      return res.status(400).json({ message: 'Feedback can only be added to resolved or closed complaints' });
    }

    const { rating, comment } = req.body;

    complaint.feedback = {
      rating: rating || complaint.feedback.rating,
      comment: comment || complaint.feedback.comment,
      date: Date.now()
    };

    await complaint.save();


    // Send notification to admin
    const io = req.app.get('io');
    if (io) {
      sendRoleBasedNotification(io, 'admin', {
        title: 'New Feedback Received',
        message: `Feedback has been provided for complaint "${complaint.title}"`,
        type: 'info',
        complaintId: complaint._id
      });
    }

    res.json({
      success: true,
      message: 'Feedback added successfully',
      complaint
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Like a complaint
// @route   POST /api/complaints/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user has already liked this complaint
    const existingLikeIndex = complaint.likes.findIndex(
      like => like.toString() === req.user.id.toString()
    );

    if (existingLikeIndex > -1) {
      // User already liked, so remove the like
      complaint.likes.splice(existingLikeIndex, 1);
    } else {
      // Remove from dislikes if it exists
      const existingDislikeIndex = complaint.dislikes.findIndex(
        dislike => dislike.toString() === req.user.id.toString()
      );

      if (existingDislikeIndex > -1) {
        complaint.dislikes.splice(existingDislikeIndex, 1);
      }

      // Add like
      complaint.likes.push(req.user.id);
    }

    await complaint.save();

    res.json({
      success: true,
      message: 'Like updated',
      likes: complaint.likes.length,
      dislikes: complaint.dislikes.length
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Dislike a complaint
// @route   POST /api/complaints/:id/dislike
// @access  Private
router.post('/:id/dislike', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user has already disliked this complaint
    const existingDislikeIndex = complaint.dislikes.findIndex(
      dislike => dislike.toString() === req.user.id.toString()
    );

    if (existingDislikeIndex > -1) {
      // User already disliked, so remove the dislike
      complaint.dislikes.splice(existingDislikeIndex, 1);
    } else {
      // Remove from likes if it exists
      const existingLikeIndex = complaint.likes.findIndex(
        like => like.toString() === req.user.id.toString()
      );

      if (existingLikeIndex > -1) {
        complaint.likes.splice(existingLikeIndex, 1);
      }

      // Add dislike
      complaint.dislikes.push(req.user.id);
    }

    await complaint.save();

    res.json({
      success: true,
      message: 'Dislike updated',
      likes: complaint.likes.length,
      dislikes: complaint.dislikes.length
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a complaint (admin only)
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Delete the complaint
    await complaint.remove();

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Assign a complaint to a user (admin only)
// @route   PUT /api/complaints/:id/assign
// @access  Private/Admin
router.put('/:id/assign', protect, admin, async (req, res) => {
  try {
    const { assignedUserId } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify that the assigned user exists
    if (assignedUserId) {
      const user = await User.findById(assignedUserId);
      if (!user) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }

      complaint.assignedUser = assignedUserId;
    } else {
      complaint.assignedUser = null;
    }

    await complaint.save();

    // Populate user data for response
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('userId', 'name email phone')
      .populate('assignedUser', 'name email');

    res.json({
      success: true,
      complaint: populatedComplaint
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;