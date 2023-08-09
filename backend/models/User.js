const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required:[true, 'First Name is Required']
	},
	lastName:{
		type: String,
		required:[true, 'Last Name is Required']
	},
	email:{
		type: String,
		required: [true, 'Email is Required']

	},
	password: {
		type: String,
		required: [true, 'Password is Required']
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
	mobileNo:{
		type: String,
		required: [true, 'Mobile Number is Required']
	},

	dateOfBirth: {
	  type: Date,
	  required: [true, 'Date of Birth is Required']
	},

	gender: {
	  type: String,
	  enum: ['Male', 'Female', 'Other'],
	},
	socialMedia: {
	  facebook: String,
	  twitter: String,
	  instagram: String,
	},
	newsletterSubscription: {
	  type: Boolean,
	  default: false,
	},

	accountStatus: {
	  type: String,
	  enum: ['Active', 'Suspended', 'Banned'],
	  default: 'Active',
	},
	lastLogin: {
	  type: Date,
	},
	resetPasswordToken: {
	  type: String,
	},
	resetPasswordTokenExpiration: {
	  type: Date,
	},
	registrationDate: {
	  type: Date,
	  default: Date.now,
	},
	isEmailVerified: {
	  type: Boolean,
	  default: false,
	},
	wishlist: [
	    {
	      type: mongoose.Schema.Types.ObjectId,
	      ref: 'Product',
	    },
	  ],
	resetToken: {
	   type: String,
	   default: null,
	 },
	 resetTokenExpiry: {
	   type: Date,
	   default: null,
	 },
})

module.exports = mongoose.model('User', userSchema)