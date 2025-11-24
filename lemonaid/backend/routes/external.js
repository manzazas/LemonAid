import { Router } from 'express';

const router = Router();

// Health / smoke endpoint (when mounted under /api/external this will be /api/external/test)
router.get('/test', (req, res) => {
  res.json({ message: 'Hello from the external route!' });
});

// Example: GET /api/external/item/:id -> proxy to service.fetchItem(id)
router.get('/item/:id', async (req, res) => {
  const id = req.params.id;
  try {
    // TODO: replace with actual service call, e.g.:
    // const data = await fetchExternalItem(id);
    const data = null; // placeholder
    res.json({ success: true, id, data });
  } catch (err) {
    res.status(502).json({ success: false, message: 'External API error', error: err.message });
  }
});

export default router;