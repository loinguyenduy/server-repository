const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// const getCart = async(req, res) => {
//   try {
//     const cart = await Cart.findOne({user: req.user._id}).populate("cartItem.product", "name image price")
//     if(cart) {
//       res.json(cart)
//     } else {
//       res.status(200).json({user: req.user._id, cartItem: [], totalPrice: 0})
//     }
//   } catch(err) {
//     console.log("Error in get cart: ", err)
//     res.status(500).json({"message" : err.message})
//   }
// }

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "cartItem.product"
    );
    if (!cart) {
      return res
        .status(200)
        .json({ user: req.user._id, cartItem: [], totalPrice: 0 });
    }

    let cartHasChanged = false;
    const originalItemCount = cart.cartItem.length;
    cart.cartItem = cart.cartItem.filter((item) => item.product !== null);

    if (cart.cartItem.length !== originalItemCount) {
      cartHasChanged = true;
    }

    cart.cartItem.forEach((item) => {
      const currentPrice = item.product.price;
      if (item.price !== currentPrice) {
        item.price = currentPrice;
        cartHasChanged = true;
      }
    });

    if (cartHasChanged) {
      cart.totalPrice = cart.cartItem.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await cart.save();
    }

    const finalCart = await Cart.findById(cart._id).populate(
      "cartItem.product",
      "name image price"
    );
    res.status(200).json(finalCart);
  } catch (err) {
    console.log("Error in get cart: ", err);
    res.status(500).json({ message: err.message });
  }
};

const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ message: "Product ID and quantity are required!" });
  }
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        cartItem: [],
        totalPrice: 0,
      });
    }

    const checkItem = cart.cartItem.findIndex(
      (item) => String(item.product) === String(productId)
    );

    if (checkItem > -1) {
      cart.cartItem[checkItem].quantity += quantity;
      cart.cartItem[checkItem].price = product.price;
    } else {
      cart.cartItem.push({
        product: productId,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: quantity,
      });
    }

    cart.totalPrice = cart.cartItem.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.log("Error in add to cart: ", err);
    res.status(500).send(err);
  }
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user!" });
    }

    const initialLength = cart.cartItem.length;
    cart.cartItem = cart.cartItem.filter(
      (item) => String(item.product) !== String(productId)
    );

    if (cart.cartItem.length === initialLength) {
      return res.status(404).json({ message: "Product not found in cart!" });
    }

    cart.totalPrice = cart.cartItem.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    await cart.save();
    res
      .status(200)
      .json({ message: "Product removed from cart successfully!", cart });
  } catch (err) {
    console.log("Error in remove from cart: ", err);
    res.status(500).send(err);
  }
};

const clearEntireCart = async (req, res) => {
  try {
    const result = await Cart.deleteOne({ user: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Cart not found for this user!" });
    }
    res.status(200).json({ message: "Cart cleared successfully!" });
  } catch (err) {
    console.log("Error in clear entire cart: ", err);
    res.status(500).send(err);
  }
};

const updateCartQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res
      .status(400)
      .json({ message: "Quantity is required and must be positive!" });
  }

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user!" });
    }

    const checkItem = cart.cartItem.findIndex(
      (item) => String(item.product) === String(productId)
    );

    if (checkItem === -1) {
      return res.status(404).json({ message: "Product not found in cart!" });
    }

    cart.cartItem[checkItem].quantity = quantity;
    cart.totalPrice = cart.cartItem.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.log("Error in update cart quantity: ", err);
    res.status(500).send(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearEntireCart,
  updateCartQuantity,
};
