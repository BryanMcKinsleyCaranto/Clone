const jwt = require('jsonwebtoken');


// Used to sign and confirm if the token is recognized/can be authenticated by our server app.
const secret = "Clone-application";


// Token Creation
module.exports.createAccessToken = (user) => {

	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	};

	return jwt.sign(data, secret, {});
};


// Token Verification

/*
	Analogy
		Receive the gift and open the lock using the secret key to verify if the sender(client who sends the request) is legitimate and if the gift was not tampered.

*/

module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization);

	// req.headers.authorization - contains sensitive data and especially our token.
	let token = req.headers.authorization;

	// This if statement will check if the token variable contains undefined or a proper jwt. If it is undefined, we will check the data type of the token with the typeof keyword, then send the message back to the client.
	if(typeof token === "undefined") {
		return res.send({auth: "Failed. No Token received."});
	} else {
		console.log(token);
		// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTc2NTgwZmMzN2YzZDNkOTMwY2Y2NCIsImVtYWlsIjoiamFtZXNAbWFpbC5jb20iLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjg4Njk0OTk1fQ.KzO6qFFQnH_iqAltp4rAs1EH2Dpo_Fbi66Npvn_RuwQ
		token = token.slice(7, token.length);

		console.log(token);
		//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTc2NTgwZmMzN2YzZDNkOTMwY2Y2NCIsImVtYWlsIjoiamFtZXNAbWFpbC5jb20iLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjg4Njk0OTk1fQ.KzO6qFFQnH_iqAltp4rAs1EH2Dpo_Fbi66Npvn_RuwQ
		// The "Bearer " was sliced afterwards
	}

	// Token decryption
	jwt.verify(token, secret, function(err, decodedToken) {
		if(err) {
			return res.send({
				auth: "Failed",
				message: err.message
			});
		} else {
			console.log(decodedToken);

			req.user = decodedToken;
			next();
		}
	})
};


// verifyAdmin function 
module.exports.verifyAdmin = (req, res, next) => {

	console.log(req.user);
	if(req.user.isAdmin) {
		next();
	} else {
		return res.send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
};

module.exports.createResetToken = (userId) => {
  return jwt.sign({ userId }, secret, { expiresIn: '1h' }); // Set the token expiration as needed (e.g., 1 hour)
};

// Function to verify the reset token
module.exports.verifyResetToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, secret);
    return decodedToken;
  } catch (error) {
    return null;
  }
};