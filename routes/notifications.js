const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/send-partner-notification', async (req, res) => {
  try {
    const { token, type, payload } = req.body;
    const result = await notificationService.sendPartnerNotification(token, type, payload);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;