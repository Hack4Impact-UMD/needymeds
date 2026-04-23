console.log('applewallet.route.ts loaded');
import { Router } from 'express';
import { createPass } from '../services/applewallet.service';

const router = Router();

router.get('/', async (req, res, next) => {
  console.log('Route hit');
  try {
    console.log('About to call createPass');

    const pkpass = await createPass({
      serial: '90MA019309343023',
      number: '90MA019309343023',
      bin: '015926',
      pcn: 'PRXIDST',
      group: 'IDST01',
      memberId: 'IDST733224411',
    });

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=needymeds.pkpass');

    res.status(200).end(pkpass);
  } catch (error: any) {
    console.error('Apple Wallet route error:', error.message); // shows error message
    console.error(error.stack); // shows full stack trace
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
      stack: error.stack,
    });
  }
});

export default router;
