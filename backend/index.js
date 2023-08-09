// Server dependencies
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv');
const userRoutes = require('./routes/user')
const orderRoutes = require('./routes/order')
const productRoutes = require('./routes/product')
const wishlistRoutes = require('./routes/wishlist')
const reviewRoutes = require('./routes/review')
const cartRoutes = require('./routes/cart')
// Server setup
const app = express()

// Environment setup
const port = 4000;


// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}))
// Allows all resources(frontend app) to access the backend application
app.use(cors());


// Mongoose connection
mongoose.connect("mongodb+srv://brymckinsley:admin123@b295.bh3xg6a.mongodb.net/clone-application?retryWrites=true&w=majority",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	}
	)

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error'));
db.once('open', () => console.log('Connected to MongoDB Atlas.'));

app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/wishlists", wishlistRoutes)
app.use("/reviews", reviewRoutes)
app.use("/carts", cartRoutes)


if(require.main === module){
	app.listen(process.env.PORT || port, () => {console.log(`Server is now running in port ${process.env.PORT || port}.`)});
}

module.exports ={app, mongoose};