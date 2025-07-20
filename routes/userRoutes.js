const express = require('express'); 
const router = express.Router(); 
const uc = require('../controller/userController'); 
const adminOnly = require('../middleware/adminOnly');  

// Public routes
router.post('/register', uc.register); 
router.post('/login', uc.login); 
router.post('/profile', uc.profile);  

// ✅ New: simplified GET /user/all
router.get('/all', uc.verifyToken, adminOnly, uc.getAllUsersSimple);

// Keep the original POST route for backward compatibility (optional)
router.post('/getAll',  uc.getAll);

// Logged-in user profile update
router.post('/update', uc.verifyToken, uc.updateProfile);  

// Optional: get user by ID
// router.get('/:id', uc.getUserById)  

module.exports = router;


