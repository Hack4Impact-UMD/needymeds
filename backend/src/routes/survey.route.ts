import { Router } from 'express';
import { sendSurveyEmail } from '../services/survey.service';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { rating, email, comments, drugName } = req.body;

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ ok: false, error: 'rating must be a number between 1 and 5' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email))) {
      return res.status(400).json({ ok: false, error: 'valid email is required' });
    }

    await sendSurveyEmail({
      rating,
      email: String(email),
      comments: comments ? String(comments) : undefined,
      drugName: drugName ? String(drugName) : undefined,
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
