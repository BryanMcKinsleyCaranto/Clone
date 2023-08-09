const Wishlist = require('../models/Wishlist');

module.exports.addToWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;

    // Find the user's wishlist or create a new one if it doesn't exist
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: [],
      });
    }

    // Check if the product is already in the user's wishlist
    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    // Add the product to the wishlist
    wishlist.products.push(productId);
    await wishlist.save();

    return res.status(200).json({ message: 'Product added to wishlist successfully' });
  } catch (error) {
    console.error('Error while adding product to wishlist:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller function to remove a product from the user's wishlist
module.exports.removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });

    // Check if the user has a wishlist
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Check if the product is in the user's wishlist
    if (!wishlist.products.includes(productId)) {
      return res.status(400).json({ error: 'Product not found in wishlist' });
    }

    // Remove the product from the wishlist
    wishlist.products = wishlist.products.filter((item) => item.toString() !== productId);
    await wishlist.save();

    return res.status(200).json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error('Error while removing product from wishlist:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.viewWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId }).populate('products');

    // Check if the user has a wishlist
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    // Extract the product information from the wishlist
    const products = wishlist.products.map((product) => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      // Add other product properties you want to include in the wishlist view
    }));

    return res.status(200).json({ wishlist: products });
  } catch (error) {
    console.error('Error while fetching user\'s wishlist:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
