const express = require('express');
const {
  getUsers,
  verifyUser,
  updateUser,
  deleteUser,
} = require('../controllers/adminController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/users').get(protect, authorize('admin'), getUsers);

router
  .route('/users/:id')
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router
  .route('/users/:id/verify')
  .put(protect, authorize('admin'), verifyUser);

module.exports = router;