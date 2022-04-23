const express = require("express")
const router = express.Router()

const userController = require("../controller/userController")
const productController = require("../controller/productController")
const cartController = require("../controller/cartController")
const orderController = require("../controller/orderController")
const middleware = require("../middleware/middleware")

router.post("/register",userController.register)
router.post("/login",userController.login)
router.get("/user/:userId/profile",middleware.authentication,userController.getProfile)
router.put("/user/:userId/profile",middleware.authentication,middleware.authByUserId,userController.updateProfile)

//Product

router.post("/products",productController.products)
router.get("/products",productController.getProductbyQuery)
router.put("/products/:productId",productController.updateProduct)
router.get("/products/:productId",productController.getProduct)
router.delete("/products/:productId",productController.deleteProduct)

//Cart
router.post("/users/:userId/cart",middleware.authentication,middleware.authByUserId,cartController.createCart)
router.put("/users/:userId/cart",middleware.authentication,middleware.authByUserId,cartController.updateCart)
router.get("/users/:userId/cart",middleware.authentication,middleware.authByUserId,cartController.getCart)
router.delete("/users/:userId/cart",middleware.authentication,middleware.authByUserId,cartController.deleteCart)

//orders

router.post("/users/:userId/orders",middleware.authentication,middleware.authByUserId,orderController.createOrder)
router.put("/users/:userId/orders",middleware.authentication,middleware.authByUserId,orderController.updateOrder)

module.exports = router



