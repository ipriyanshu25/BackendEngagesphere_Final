const express = require('express');
const router  = express.Router();
const adminC  = require('../controller/adminController');



// Authentication
router.post('/login',           adminC.login);
router.post('/forgot-password', adminC.forgotPassword);
router.post('/reset-password',  adminC.resetPassword);

// Email update flow
router.post('/update-email/request', adminC.updateEmail);
// router.post('/update-email/verify',  adminC.verifyEmailUpdate);

// Password update
router.post('/update-password', adminC.updatePassword);

// router.post('/updatestauts', adminC.updateStatus);

module.exports = router;
