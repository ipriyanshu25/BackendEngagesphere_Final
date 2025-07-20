

// module.exports = router;
const express = require('express');
const router = express.Router();

const {
  createOrder,
  captureOrder,
  getPaymentDetails,
  getAllPayments // ✅ Import this for admin panel
} = require('../controller/paymentController');

// ✅ User payment flow
router.post('/create', createOrder);
router.post('/capture', captureOrder);
router.post('/get', getPaymentDetails);

// ✅ Admin panel - fetch all payments
router.get('/all', getAllPayments); // <== This is required for admin dashboard

module.exports = router;
