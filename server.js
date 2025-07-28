//this file create server Express
//import express library
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config({ path: "./config/config.env" });
//initialize express
const app = express();

//import body-parser to handle data from client (json)
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// config cors
var corsOptions = {
  origin: ["http://localhost:8080", "vietflavor.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

//import mongoose library for database access
const mongoose = require("mongoose");

//declare url and database server_url + database_name
// const DATABASE_URL = "mongodb://localhost:27017/coursework_project";
const DATABASE_URL =
  "mongodb+srv://nguyenduyloi04:rn8iNQBktgVhwhY3@cluster0.8bcuvdp.mongodb.net/coursework_project";

mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("Connect to Database succeed!"))
  .catch((err) => console.error("Connect to Database failed!" + err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//connect image
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//declare router for category
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

categoryRoutes(app);
productRoutes(app);
userRoutes(app);
adminRoutes(app);
cartRoutes(app);
orderRoutes(app);

//config port and start server
// const SERVER_PORT = 3000;
const SERVER_PORT = process.env.PORT || 3001; //3001: optimized for Render
app.listen(SERVER_PORT, () => {
  console.log("http://localhost:" + SERVER_PORT);
});
