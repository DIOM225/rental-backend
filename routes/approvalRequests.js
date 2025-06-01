const express = require('express');
const router = express.Router();
const ApprovalRequest = require('../models/ApprovalRequest');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

// 🔹 Submit an approval request
router.post('/', verifyToken, async (req, res) => {
  const existing = await ApprovalRequest.findOne({ userId: req.user.id, status: 'pending' });
  if (existing) return res.status(400).json({ message: 'You already have a pending request.' });

  const request = new ApprovalRequest({ userId: req.user.id });
  await request.save();
  res.status(201).json({ message: 'Approval request submitted.' });
});

// 🔹 Admin gets all requests
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  const requests = await ApprovalRequest.find().populate('userId', 'email name approved');
  res.json(requests);
});

// 🔹 Admin approves a request
router.patch('/:id/approve', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  const request = await ApprovalRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  await ApprovalRequest.findByIdAndUpdate(req.params.id, { status: 'approved' });
  await User.findByIdAndUpdate(request.userId, { approved: true });

  res.json({ message: 'User approved.' });
});

module.exports = router;
