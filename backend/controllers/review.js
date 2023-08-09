const Order = require('../models/order');
const Review = require('../models/review');

// Controller function to add review and rating for a product
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const userId = req.user.id;

    // Find the order that includes the product and belongs to the user
    const order = await Order.findOne({
      user: userId,
      'products.product': productId,
    });

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Find the product in the order
    const productInOrder = order.products.find((product) => product.product.toString() === productId);

    // Check if the product is in the order
    if (!productInOrder) {
      return res.status(404).json({ error: 'Product not found in order' });
    }

    // Check if the product has already been reviewed
    if (productInOrder.review || productInOrder.rating) {
      return res.status(400).json({ error: 'Product already reviewed' });
    }

    // Create a new review document in the Review model
    const newReview = new Review({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    // Save the new review
    await newReview.save();

    // Add the review reference to the order
    productInOrder.review = newReview._id;
    productInOrder.rating = rating;
    await order.save();

    return res.status(200).json({ message: 'Review and rating added successfully' });
  } catch (error) {
    console.error('Error while adding review and rating:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getReviewsForProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find all reviews for the given product
    const reviews = await Review.find({ product: productId }).populate('user', 'firstName lastName');

    // Check if reviews exist for the product
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({ error: 'No reviews found for the product' });
    }

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error('Error while fetching reviews:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};