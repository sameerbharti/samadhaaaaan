const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'street-light',
        'water-pipe',
        'rain-drainage',
        'road-reconstruction',
        'garbage-system',
        'other'
      ],
      message: 'Category must be one of the specified options'
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high',
      default: 'medium'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: [
        'pending',
        'in-progress',
        'resolved',
        'rejected'
      ],
      message: 'Status must be one of the specified options',
      default: 'pending'
    },
    default: 'pending'
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: String
  },
  images: [{
    type: String // Array of image URLs
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  },
  resolutionDate: Date,
  estimatedResolutionDate: Date,
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  proofOfWork: [{
    type: String // Array of image URLs showing completed work
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);