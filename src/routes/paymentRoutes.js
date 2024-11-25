import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @route POST /api/payment
// @desc Process payment
router.post('/payment', async (req, res) => {
  const { amount, currency, paymentMethodId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirm: true,
    });

    res.status(201).json({ message: 'Payment successful', paymentIntent });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
