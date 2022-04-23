const cartModel = require("../models/cartModel")
const validator = require("../validator/validator")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")



const createCart = async function (req, res) {
    try {
        let id = req.params.userId;
        let data = req.body;

        let { userId, items } = data

        if (!validator.isValidobjectId(id)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid userId" })
        }

        if (!validator.isValidReqBody(data)) {
            return res.status(400).send({ status: false, msg: "Please enter some data" })
        }

        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "UserId is required" })
        }

        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid userId" })
        }

        let findUser = await userModel.findById(id)
        if (!findUser) {
            return res.status(404).send({ status: false, msg: "User not Found" })
        }

        if (id !== userId) {
            return res.status(400).send({ status: false, msg: "UserId Should Match" })
        }
        if (items.length == 0) {
            return res.status(400).send({ status: false, msg: "please send data in items" })
        }

        let productId = items.productId

        let findCart = await cartModel.findOne({ userId: id })
        if (findCart) {
            let findProduct = await productModel.findOne({ productId }).select({ price: 1, _id: 0 })
            if (!findProduct) {
                return res.status(404).send({ status: false, msg: "Product not found" })
            }
            let getPrice = findProduct.price;

            for (i = 0; i < items.length; i++) {
                if (items[i].quantity > 0)
                    var storePrice = (items[i].quantity * getPrice)
            }

            let cartDetails = {
                userId: userId,
                items: items,
                totalPrice: storePrice,
                totalItems: items.length
            }
            let addCart = await cartModel.findOneAndUpdate({ userId }, { $set: cartDetails }, { new: true })
            return res.send({ status: true, msg: "Cart Added Successfully", data: addCart })
        }


        if (!findCart) {

            let findProduct = await productModel.findOne({ productId }).select({ price: 1, _id: 0 })
            if (!findProduct) {
                return res.status(404).send({ status: false, msg: "Product not found" })
            }
            var getPrice = findProduct.price;

            for (i = 0; i < items.length; i++) {
                if (items[i].quantity > 0)
                    var storePrice = (items[i].quantity * getPrice)
            }

            let cartDetails = {
                userId: userId,
                items: items,
                totalPrice: storePrice,
                totalItems: items.length
            }
            let document = await cartModel.create(cartDetails)
            return res.status(201).send({ status: true, msg: "Cart Created Successfully", data: document })
        }

    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


const getCart = async function (req, res) {
    try {
        userId = req.params.userId;

        let findUser = await userModel.findById(userId)
        if (!findUser) {
            return res.status(404).send({ status: false, msg: "User not Found" })
        }

        let searchCart = await cartModel.findOne({ userId: userId })
        if (!searchCart) {
            return res.status(404).send({ status: false, msg: "User dose not have any cart" })
        }

        return res.status(200).send({ status: true, msg: "Cart Details", data: searchCart })
    }

    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


const deleteCart = async function (req, res) {
    try {
        userId = req.params.userId;

        let findUser = await userModel.findById(userId)
        if (!findUser) {
            return res.status(404).send({ status: false, msg: "User not Found" })
        }

        let searchCart = await cartModel.findOne({ userId: userId })

        if (!searchCart) {
            return res.status(404).send({ status: false, msg: "User does not have any cart" })
        }
        const { items, totalPrice } = searchCart

        if (items.length == 0 && totalPrice == 0) {
            return res.status(400).send({ status: false, msg: "Cart is Already Empty" })
        }

        let emptyCart = await cartModel.findOneAndUpdate({ userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })
        return res.status(204).send({ status: true, message: "Cart deleted Successfully", data: emptyCart })
    }

    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

// const deleteCart = async function (req, res) {
//     try {
//         userId = req.params.userId;

//         let findUser = await userModel.findById(userId)
//         if (!findUser) {
//             return res.status(404).send({ status: false, msg: "User not Found" })
//         }

//         let searchCart = await cartModel.findOne({ userId: userId })

//         if (!searchCart) {
//             return res.status(404).send({ status: false, msg: "User does not have any cart" })
//         }

//         let { items, totalItems, totalPrice } = searchCart

//         if (items.length == 0 && totalItems == 0) {
//             return res.status(400).send({ status: false, msg: "Cart Is Already Empty" })
//         }

//         if (items.length > 0) {
//             items.pop();
//         }

//         if (items.length == 0) {
//             totalItems = totalItems * items.length;
//             totalPrice = totalPrice * items.length;
//         }

//         let empty = {
//             userId: userId,
//             items: items,
//             totalItems: totalItems,
//             totalPrice: totalPrice
//         }
//         let emptyCart = await cartModel.findOneAndUpdate({ userId }, { $set: empty }, { new: true })
//         return res.status(204).send({ status: true, msg: "Cart deleted Successfully", data: emptyCart })
//     }

//     catch (error) {
//         res.status(500).send({ status: false, msg: error.message })
//     }
// }



const updateCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body

        let { removeProduct, productId } = data

        if (!validator.isValidReqBody(data)) {
            return res.status(400).send({ status: false, msg: "Please enter some data" })
        }

        let findUser = await userModel.findById(userId)
        if (!findUser) {
            return res.status(404).send({ status: false, msg: "User not Found" })
        }

        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "ProductId is required" })
        }

        if (!validator.isValid(removeProduct)) {
            return res.status(400).send({ status: false, msg: "RemoveProduct is required" })
        }

        let searchCart = await cartModel.findOne({ userId: userId })
        if (!searchCart) {
            return res.status(404).send({ status: false, msg: "User does not have any cart" })
        }
        let { items, totalItems, totalPrice } = searchCart

        let findProduct = await productModel.findOne({ productId }).select({ price: 1, _id: 0 })
        if (!findProduct) {
            return res.status(404).send({ status: false, msg: "Product not found" })
        }
        var getPrice = findProduct.price;


        for (let i = 0; i < items.length; i++) {
            if (items[i].productId == productId) {
                let totelProductprice = items[i].quantity * getPrice

                if (removeProduct === 0) {
                    const updateProductItem = await cartModel.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: productId } }, totalPrice: searchCart.totalPrice - totelProductprice, totalItems: searchCart.totalItems - 1 }, { new: true })
                    return res.status(200).send({ status: true, msg: 'sucessfully removed product', data: updateProductItem })

                }
                if (removeProduct === 1) {
                    if (items[i].quantity === 1 && removeProduct === 1) {
                        const removeCart = await cartModel.findOneAndUpdate({ userId: userId }, { $pull: { items: { productId: productId } }, totalPrice: searchCart.totalPrice - totelProductprice, totalItems: searchCart.totalItems - 1 }, { new: true })
                        return res.status(200).send({ status: true, msg: 'sucessfully removed product or cart is empty', data: removeCart })
                    }
                    items[i].quantity = items[i].quantity - 1
                    const updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: items, totalPrice: searchCart.totalPrice - getPrice }, { new: true });
                    return res.status(200).send({ status: true, msg: 'sucessfully decress product', data: updateCart })
                }
            }


        }
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}

module.exports = { createCart, updateCart, getCart, deleteCart }
