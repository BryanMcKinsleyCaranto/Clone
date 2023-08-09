const User = require("../models/User");
const bcrypt = require('bcrypt');
const Order = require('../models/order');
const {createAccessToken } = require('../auth');
const { createResetToken, verifyResetToken } = require('../auth');
const nodemailer = require('nodemailer');
const saltRounds = 10; 
const auth = require('../auth');

module.exports.register = async (req, res) => {
try {
    const { firstName, lastName, email, password, mobileNo, dateOfBirth } = req.body;

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document in the database
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobileNo,
      dateOfBirth
    });

    // Save the new user in the database
    await newUser.save();

    // Return success response
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // Handle any errors that occur during registration
    console.error('Error during user registration:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.login = async(req,res) =>{
  try {
      const { email, password } = req.body;

      // Check if the user with the given email exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Compare the provided password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate an access token using the createAccessToken function from auth.js
      const token = createAccessToken(user);

      // Return the token in the response
      return res.status(200).json({ token });
    } catch (error) {
      // Handle any errors that occur during login
      console.error('Error during user login:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  module.exports.getUserProfile = async(req,res) =>{
  try {
    // Fetch the user data from the authenticated request
    const user = await User.findById(req.user.id);

    // Exclude sensitive information like password before sending the response
    const userProfile = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNo: user.mobileNo,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
    };

    return res.status(200).json(userProfile);
  } catch (error) {
    // Handle any errors that occur during fetching the profile
    console.error('Error while fetching user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports.updateUserProfile = async(req,res) =>{

	try {
	   const { firstName, lastName, email, mobileNo, dateOfBirth, address } = req.body;

	   // Fetch the user data from the authenticated request
	   const user = await User.findById(req.user.id);

	   // Update user profile fields
	   user.firstName = firstName;
	   user.lastName = lastName;
	   user.email = email;
	   user.mobileNo = mobileNo;
	   user.dateOfBirth = dateOfBirth;
	   user.address = address;

	   // Save the updated user profile to the database
	   await user.save();

	   return res.status(200).json({ message: 'User profile updated successfully' });
	 } catch (error) {
	   // Handle any errors that occur during updating the profile
	   console.error('Error while updating user profile:', error);
	   return res.status(500).json({ error: 'Internal server error' });
	 }
}



exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // User ID obtained from the authenticated token

    // Find the user by ID
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify the old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error while changing password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.initiatePasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found, return an error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a reset token using the createResetToken function
    const resetToken = createResetToken(user._id);

    // Set the reset token and expiry in the user document
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Send the reset link to the user's email
    const transporter = nodemailer.createTransport({
      service: 'yahoo',
      auth: {
        user: 'bryalmighty15@yahoo.com', // Replace with your Yahoo email
        pass: 'yfhblanuljtpwnki', // Replace with the App Password generated for Nodemailer
      },
    });

    const mailOptions = {
      from: 'bryalmighty15@yahoo.com', // Replace with your email
      to: email,
      subject: 'Password Reset',
      text: `Click the link to reset your password: http://localhost:4000/users/reset-password/${resetToken}`,
      // You can also use HTML for the email body: html: `<p>Click the link to reset your password: <a href="http://your_website.com/reset-password/${resetToken}">Reset Password</a></p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send reset link' });
      } else {
        console.log('Email sent:', info.response);
        return res.status(200).json({ message: 'Password reset link sent to your email' });
      }
    });
  } catch (error) {
    console.error('Error while initiating password reset:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller function to reset password
module.exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const resetToken = req.params.resetToken;

    // Verify the reset token
    const decodedToken = auth.verifyResetToken(resetToken);

    // If token is invalid/expired, return an error
    if (!decodedToken || !decodedToken.userId) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Find the user by the decoded user ID and check if the reset token is valid
    const user = await User.findOne({
      _id: decodedToken.userId,
      resetToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    // If user not found or the reset token is invalid/expired, return an error
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password before updating
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the user's password with the hashed password
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error while resetting password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports.promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Promote the user to admin
    user.isAdmin = true;
    await user.save();

    return res.status(200).json({ message: 'User promoted to admin successfully' });
  } catch (error) {
    console.error('Error promoting user to admin', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};