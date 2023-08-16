// Dependencies and Modules
const express = require('express');
const userController = require('../controllers/user');
const auth = require('../auth');

// destructure the auth file:
// here we use the verify and verifyAdmin as auth middlewares.
const { verify, verifyAdmin } = auth;
const router = express.Router();

// route for registering user
router.post('/register', userController.register);

// route for logging in
router.post('/login', userController.login);
router.get("/details", verify, userController.getProfile)
// route for user profile
router.get('/profile', verify, userController.getUserProfile);
router.put('/profile', verify, userController.updateUserProfile);

// route to change password
router.post('/change-password', verify, userController.changePassword);


router.post('/reset-password', userController.initiatePasswordReset);



// Reset password
router.post('/reset-password/:resetToken', userController.resetPassword);

router.put('/promote/:userId', verify, verifyAdmin, userController.promoteToAdmin);

module.exports = router;
module.exports = router;