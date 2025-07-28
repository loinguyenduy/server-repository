const orderController = require("../controllers/orderController");
const { protect, admin } = require("../middleware/auth");

const OrderRoute = (app) => {
  app.route("/api/orders").post(protect, orderController.addOrderItem);

  app.route("/api/orders/myorders").get(protect, orderController.getOrder);

  app.route("/api/orders/:id").get(protect, orderController.getOrderById);

  //admin
  app
    .route("/api/admin/orders")
    .get(protect, admin, orderController.getAllOrder);

  app
    .route("/api/admin/orders/:id/status")
    .put(protect, admin, orderController.updateOrderStatus);

  app
    .route("/api/admin/orders/:id")
    .get(protect, admin, orderController.getAdminOrderById);
};

module.exports = OrderRoute;
