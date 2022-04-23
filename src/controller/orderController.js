const validator = require("../validator/validator")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const orderModel = require("../models/orderModel")
const cartModel = require("../controller/cartController")

const createOrder = async function (req, res) {
    try {

        const id = req.params.userId;
        const input = req.body;

        if (!validator.isValidobjectId(id)) {
            return res.status(400).send({ status: false, message: `${id} is not a valid user id` })
        }

        if (!validator.isValidReqBody(input)) {
            return res.status(400).send({ status: false, msg: "Please Enter some data to create" })
        }

        const { userId, items } = input

        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: 'userid is required in the request body' })
        }
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        }

        if (id !== userId) {
            return res.status(400).send({ status: false, msg: "Pass Same UserID" })
        }

        const user = await userModel.findOne({ userId: id })
        if (!user) {
            return res.status(400).send({ status: false, msg: "No Such User Exists" })
        }

        if (items.length === 0) {
            return res.status(400).send({ status: false, msg: 'items cant be empty' })
        }
        if (!validator.isValid(items)) {
            return res.status(400).send({ status: false, message: 'items is required in the request body' })
        }

        let { productId, quantity } = items
        let totalPrice = 0
        let qty = 0

        for (let i = 0; i < items.length; i++) {
            let productId = items[i].productId
            quantity = items[i].quantity

            const product = await productModel.findOne({ _id: productId, isDeleted: false })
            if (!product) {
                return res.status(404).send({ status: false, msg: "No such Product Found" })
            }

            price = product.price

            totalPrice = totalPrice + (price * quantity)

            qty = qty + quantity
        }
        const final = {
            userId: id,
            items: items,
            totalPrice: totalPrice,
            totalItems: items.length,
            totalQuantity: qty


        }

        const createProduct = await orderModel.create(final)
        return res.status(201).send({ status: true, msg: 'sucesfully created order', data: createProduct })

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId;
        let data = req.body;

        let { orderId, status } = data

        if (!validator.isValidReqBody(data)) {
            return res.status(400).send({ status: false, msg: "Please enter some data" })
        }

        let findUser = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!findUser) {
            return res.status(404).send({ status: false, msg: "User not Found" })
        }

        if (!validator.isValid(orderId)) {
            return res.status(400).send({ status: false, msg: "OrderId is required" })
        }

        if (!validator.isValidobjectId(orderId)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid orderId" })
        }

        if (!validator.isValid(status)) {
            return res.status(400).send({ status: false, msg: "status is required" })
        }

        let checkOrder = await orderModel.findOne({ _id: orderId, userId: userId })
        if (!checkOrder) {
            return res.status(404).send({ status: false, msg: "Order not Found for this User" })
        }
        if (checkOrder.cancellable == true) {

            if (checkOrder.status == 'pending') {

                if (!validator.isStatus(status)) {
                    return res.status(400).send({ status: false, msg: "Please enter a valid status" })

                }
                let alterStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })
                if (!alterStatus) {
                    return res.status(400).send({ status: false, msg: "Unable to change the status" })
                }
                return res.status(200).send({ status: true, message: "Order Updated Successfully", data: alterStatus })
            }

            if (checkOrder.status == 'completed') {
                return res.status(400).send({ status: false, message: "its Completed unable to change status" })
            }

        }

        if (checkOrder.cancellable == false) {

            if (checkOrder.status == 'pending') {

                if (!validator.isStatus(status)) {
                    return res.status(400).send({ status: false, msg: "Please enter a valid status" })
                }

                if (status == 'cancelled') {
                    return res.status(400).send({ status: false, msg: "its not cancellable" })
                }

                let alterStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })
                if (!alterStatus) {
                    return res.status(400).send({ status: false, msg: "Unable to change the status" })
                }

                return res.status(200).send({ status: true, message: "Order Updated Successfully", data: alterStatus })
            }

            if (checkOrder.status == 'completed') {
                return res.status(400).send({ status: false, message: "its Completed unable to change status" })
            }

        }
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


// const updateOrder =async function(req,res){
//     try{
//         let requestBody = req.body;
//         const userId = req.params.userId

//         const { orderId } = requestBody

//         if (!validator.isValidReqBody(requestBody)) {
//             res.status(400).send({ status: false, message: 'Please provide cart details' });
//             return;
//         }
//         if (!validator.isValid(orderId)) {
//             return res.status(400).send({ status: false, message: 'orderId is required in the request body' })
//         }
//         if (!validator.isValidobjectId(orderId)) {
//             return res.status(400).send({ status: false, message: `${orderId} is not a valid user id` })
//         }
//         const checkOrder = await orderModel.findOne({ _id: orderId, isDeleted: false })
//         if(!checkOrder){
//             return res.status(404).send({ status: false, message: 'No Such Data Found ' })
//         }
//         if (!(checkOrder.userId == userId)) {
//             return res.status(400).send({ status: false, message: 'order not belongs to the user ' })
//         } 
//         if (!(checkOrder.cancellable === true)) {
//             return res.status(400).send({ status: false, message: 'order didnt have the cancellable policy ' })
//         }
//         if(checkOrder.status === "completed"){
//             return res.status(400).send({status : false,message:"order is already delivered"})
//         }
//         let updateOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: "canceled" }, { new: true })
//        return res.status(200).send({ status: true, msg: 'succesfully updated', data: updateOrder })

//     }
//     catch(error){
//         return res.status(500).send({status:false,msg:error.message})
//     }
// }

module.exports = { createOrder, updateOrder }
