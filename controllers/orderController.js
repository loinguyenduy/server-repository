const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");

// create order
const addOrderItem = async (req, res) => {
  try {
    const { shippingAddress, deliveryType, paymentMethod, note } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.cartItem.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found!" });
    }

    const orderItem = cart.cartItem.map((item) => ({
      product: item.product,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    }));

    const itemPrice = Number(cart.totalPrice.toFixed(2));

    let shippingPrice = 0;
    if (deliveryType === "shipping") {
      shippingPrice = 5.0;
    }
    shippingPrice = Number(shippingPrice.toFixed(2));

    const taxPrice = Number((0.1 * itemPrice).toFixed(2));
    const totalPrice = Number(
      (itemPrice + shippingPrice + taxPrice).toFixed(2)
    );

    const order = new Order({
      user: req.user._id,
      orderItem,
      paymentMethod,
      itemPrice,
      shippingAddress:
      deliveryType === "shipping" ? shippingAddress : undefined,
      deliveryType,
      paymentMethod,
      itemPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      note: note || "",
    });

    const createdOrder = await order.save();
    await Cart.deleteOne({ user: req.user._id });
    res.status(201).json(createdOrder);
  } catch (err) {
    res.status(500).send(err);
  }
};

// get order (user)
const getOrder = async (req, res) => {
  try {
    const order = await Order.find({ user: req.user._id }).populate(
      "user",
      "fullName email"
    );
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
};

// get order by id
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate("user", "fullName email")
      .populate("orderItem.product", "name price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to view this order!" });
    }

    order.orderItem.forEach((item) => {
      if (!item.product) {
        item.product = {
          _id: null,
          name: `${item.name} (Product no longer available)`,
          image: item.image,
          price: item.price,
        };
      }
    });
    res.json(order);
  } catch (err) {
    if (err.kind === "Object Id") {
      return res.status(400).json({ message: "Invalid Order ID" });
    }
    res.status(500).send(err);
  }
};

//get order by id(admin)
const getAdminOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId)
      .populate("user", "fullName email")
      .populate("orderItem.product", "name price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    order.orderItem.forEach((item) => {
      if (!item.product) {
        item.product = {
          _id: null,
          name: `${item.name} (Product no longer available)`,
          image: item.image,
          price: item.price,
        };
      }
    });
    res.json(order);
  } catch (err) {
    console.error("Error in get admin order by id: ", err);
    if (err.kind === "Object Id") {
      return res.status(400).json({ message: "Invalid Order ID" });
    }
    res.status(500).send(err);
  }
};

// get all order (admin)
const getAllOrder = async (req, res) => {
  try {
    const order = await Order.find({})
      .populate("user", "id fullName email")
      .sort({ createdAt: -1 });

    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
};

// update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    const validStatus = ["pending", "processing", "completed", "cancelled"];
    if (!status || !validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }
    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid Order ID!" });
    }
    res.status(500).send(err);
  }
};

module.exports = {
  addOrderItem,
  getOrder,
  getOrderById,
  getAllOrder,
  getAdminOrderById,
  updateOrderStatus,
};
