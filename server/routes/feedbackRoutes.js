import express from 'express';
import {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback,
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(submitFeedback)
  .get(getAllFeedback);

router.route('/:id')
  .get(protect, getFeedbackById)
  .delete(protect, deleteFeedback);

export default router;
