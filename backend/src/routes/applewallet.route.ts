import { Router } from 'express';
import { createPass } from '../services/applewallet.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const cardNumber = '90MA019309343023';

    const pkpass = await createPass({
      serial: cardNumber,
      number: cardNumber,
    });

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=needymeds.pkpass');

    res.status(200).send(pkpass);
  } catch (error) {
    next(error);
  }
});

export default router;
