
const CartController = require("../controllers/cartController")
const {protect} = require("../middleware/auth")

const CartRoute = (app) => {
  app.route("/api/cart")
    .get(protect, CartController.getCart);

  app.route("/api/cart/add")
    .post(protect, CartController.addToCart);

  app.route("/api/cart/clear") 
    .delete(protect, CartController.clearEntireCart);

  app.route("/api/cart/remove/:productId") 
    .delete(protect, CartController.removeFromCart);

  app.route("/api/cart/update/:productId") 
    .put(protect, CartController.updateCartQuantity);
}

module.exports = CartRoute