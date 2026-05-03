import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Webhook endpoint for Lemon Squeezy
router.post('/webhook', async (req, res) => {
  try {
    // Verify signature
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-signature'] as string;

    if (!signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Verify the webhook signature
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(JSON.stringify(req.body));
    const digest = hmac.digest('hex');

    if (digest !== signature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const eventName = req.body.meta.event_name;

    if (eventName === 'order_created' || eventName === 'order_paid') {
      // Handle payment success event
      const customData = req.body.data.attributes.custom_data;
      const name = customData?.name;
      const intent = customData?.intent;

      if (name && intent) {
        // Here you would usually save to a database, but since we're using localStorage
        // For demo purposes we'll just log it
        console.log('✅ Payment successful for name:', name);
        console.log('Intent:', intent);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
