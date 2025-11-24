// users.js: placeholder removed. User-related DB functionality has been retired
// from this project. If you need to reintroduce user endpoints, recreate
// this module with the desired routes and DB logic.

import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.status(410).json({ success: false, message: 'users endpoint removed' });
});

export default router;