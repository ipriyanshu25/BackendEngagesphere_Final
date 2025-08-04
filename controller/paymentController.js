require('dotenv').config();
const Razorpay   = require('razorpay');
const crypto     = require('crypto');
const Payment    = require('../model/payment');
const User       = require('../model/user');
const Plan       = require('../model/plan');

// initialize Razorpay client
const razorpay = new Razorpay({
  key_id:    process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a new Razorpay order and persist it in the Payment collection,
 * storing only userId and planId.
 */
exports.createOrder = async (req, res) => {
  try {
    const { userId, planId, pricingId, currency = 'USD', receipt } = req.body;

    // 1. Validate required fields
    if (!userId || !planId || !pricingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, planId, pricingId'
      });
    }

    // 2. Verify user exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 3. Verify plan exists
    const plan = await Plan.findOne({ planId });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // 4. Locate the pricing tier
    const tier = plan.pricing.find(p => p.pricingId === pricingId);
    if (!tier) {
      return res.status(404).json({
        success: false,
        message: `Pricing option ${pricingId} not found for plan ${planId}`
      });
    }

    // 5. Convert "$24.99" → 2499 (cents)
    const amountCents = Math.round(parseFloat(tier.price.replace(/[^0-9.-]+/g,"")) * 100);

    // 6. Create Razorpay order
    const options = {
      amount:  amountCents,
      currency,
      receipt: receipt || crypto.randomBytes(10).toString('hex'),
    };
    const order = await razorpay.orders.create(options);

    // 7. Persist minimal record
    await Payment.create({
      orderId:   order.id,
      amount:    order.amount,
      currency:  order.currency,
      receipt:   order.receipt,
      userId,
      planId,
      pricingId,           // track which tier was chosen
      status:    'created',
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Error in createOrder:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Verify Razorpay signature, update status to 'paid',
 * and return success/failure.
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                       .digest('hex');
    if (hmac !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Fetch payment status from Razorpay
    const razorPayment = await razorpay.payments.fetch(razorpay_payment_id);
    if (razorPayment.status !== 'captured') {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: razorPayment.status }
      );
      return res.status(400).json({
        success: false,
        message: `Payment status: ${razorPayment.status}`
      });
    }

    // Update record as paid
    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status:    'paid',
        paidAt:    new Date(),
      }
    );

    return res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return res.status(500).json({
      success: false,
      message:  error.message
    });
  }
};
