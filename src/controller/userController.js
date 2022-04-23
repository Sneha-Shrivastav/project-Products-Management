const userModel = require("../models/userModel")
const validator = require("../validator/validator")
const bcrypt = require('bcrypt');
const aws = require("../aws/aws")
const jwt = require("jsonwebtoken")



const register = async function (req, res) {
    try {
        const data = req.body

        if (!validator.isValidReqBody(data)) {
            return res.status(400).send({ status: false, msg: "Enter valid data" })
        }

        if (validator.isValidReqBody(req.query)) {
            return res.status(400).send({ status: false, msg: "data in query params are not required" })
        }

        const { fname, lname, email, phone, address } = data


        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, msg: "Please enter Valid First Name" })
        }


        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, msg: "Please enter Valid Last Name" })
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Please enter a Email Id" })

        }
        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "email is not valid" })

        }

        const duplicateEmail = await userModel.findOne({ email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: "This Email ID already exisits in out Database...Please Enter a unique email id" })
        }

        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, msg: "Please enter a Phone Number" })

        }

        if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, message: "Mobile Number is not valid" })
        }

        const duplicatePhone = await userModel.findOne({ phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, msg: "This Phone Number already exisits in out Database...Please Enter a unique Phone Number" })
        }

        if (!validator.isValid(data.password)) {
            return res.status(400).send({ status: false, msg: "Enter password" })
        }
        if (!(/^.{8,15}$/).test(data.password)) {
            return res.status(400).send({ status: false, msg: "Password Length should be between 8 and 15" })
        }
        // generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        data.password = await bcrypt.hash(data.password, salt);

        const a = JSON.parse(address)
        const { shipping, billing } = a

        if (!validator.isValid(shipping.street)) {
            return res.status(400).send({ status: false, msg: " Enter Street Name" })
        }

        if (!validator.isValid(shipping.city)) {
            return res.status(400).send({ status: false, msg: " Enter City Name" })
        }

        if (!validator.isValid(shipping.pincode)) {
            return res.status(400).send({ status: false, msg: " Enter Pincode" })
        }

        if (!(shipping.pincode.toString().length === 6)) {
            return res.status(400).send({ status: false, msg: "Enter Valid Shipping Pincode" })
        }

        if (!validator.isValid(billing.street)) {
            return res.status(400).send({ status: false, msg: " Enter Street Name" })
        }

        if (!validator.isValid(billing.city)) {
            return res.status(400).send({ status: false, msg: " Enter City Name" })
        }

        if (!validator.isValid(billing.pincode)) {
            return res.status(400).send({ status: false, msg: " Enter Pincode" })
        }

        if (!(billing.pincode.toString().length === 6)) {
            return res.status(400).send({ status: false, msg: "Enter Valid billing Pincode" })
        }


        let files = req.files
        if (files && files.length > 0) {
            var uploadedFileURL = await aws.uploadFile(files[0])

        } else {
            return res.status(400).send({ msg: "No file found" })
        }


        const input = {
            fname: fname,
            lname: lname,
            email: email,
            profileImage: uploadedFileURL,
            phone: phone,
            password: data.password,
            address: a
        }

        const output = await userModel.create(input)
        return res.status(201).send({ status: true, msg: "User Succesfully Created", data: output })


    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message })
    }

}

const login = async function (req, res) {
    try {
        const data = req.body
        if (!validator.isValidReqBody(data)) {
            return res.status(400).send({ status: false, msg: "Please enter some Data from Your end" })
        }

        const { email, password } = data

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Please enter Email Id" })
        }

        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "email is not valid" })

        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, msg: "Please enter Password" })
        }
        if (!(/^.{8,15}$/).test(data.password)) {
            return res.status(400).send({ status: false, msg: "Password Length should be between 8 and 15" })
        }

        const user = await userModel.findOne({ email })

        if (user) {
            // check user password with hashed password stored in the database
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                res.status(400).send({ status: false, msg: "Invalid Password" });
            }
        } else {
            res.status(401).send({ status: false, msg: "User does not exist" });
        }

        const token = jwt.sign({
            userId: user._id.toString(),
            group: "11",
            iat: Math.floor(Date.now() / 1000),         //doubt clear about this after some time   //payload
            exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60    //1 hours:minute:second
        }, "group11")

        res.setHeader("x-api-key", token)
        const output = {
            userId: user._id,
            token: token
        }

        return res.status(200).send({ status: true, msg: "User login successfull", data: output })

    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

const getProfile = async function (req, res) {
    try {
        let userId = req.params.userId;

        let findProfile = await userModel.findOne({ _id : userId })
        if (!findProfile) {
            return res.status(404).send({ status: false, msg: "UserId Not Found" })
        }

        return res.status(200).send({ status: true , msg: "User profile details", data: findProfile })
    }



    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message })
    }
}

const updateProfile = async (req, res) => {
    try {
        let data = req.body
        const id = req.params.userId

        if (!validator.isValidobjectId(id)) {
            res.status(400).send({ status: false, message: `${id} is not a valid user id ` })
            return
        }

        const userPresent = await userModel.findById({ _id: id })

        if (!userPresent) return res.status(404).send({ status: false, msg: "User not found" })


        if (!validator.isValidReqBody(data)) {
            if(!(validator.isValidReqBody(req.files)))
            return res.status(400).send({ status: false, msg: "Please enter Data to be updated" })
        }

        const { fname, lname, email, phone, address, password } = data

        if (fname) {
            if (!validator.isValid(fname)) {
                return res.status(400).send({ status: false, msg: "Please Send Valid First Name " })
            }
        }

        if (lname) {
            if (!validator.isValid(lname)) {
                return res.status(400).send({ status: false, msg: "Please Send Valid Last Name " })
            }
        }

        if (email) {
            if (!validator.isValid(email)) {
                return res.status(400).send({ status: false, msg: "Please Send Valid Email ID " })
            }

            if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email))) {
                return res.status(400).send({ status: false, message: "email is not valid" })

            }
        }

        if (phone) {
            if (!validator.isValid(phone)) {
                return res.status(400).send({ status: false, msg: "Please Send Valid Phone Number " })
            }

            if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
                return res.status(400).send({ status: false, message: "Mobile Number is not valid" })
            }
        }

        if (req.files) {
            let files = req.files
            if (files && files.length > 0) {
                var uploadedFileURL = await aws.uploadFile(files[0])

            }
        }


        if (address) {
            const a = JSON.parse(address)
            const { shipping, billing } = a

            if (!validator.isValid(shipping.street)) {
                return res.status(400).send({ status: false, msg: " Enter Street Name" })
            }

            if (!validator.isValid(shipping.city)) {
                return res.status(400).send({ status: false, msg: " Enter City Name" })
            }

            if (!validator.isValid(shipping.pincode)) {
                return res.status(400).send({ status: false, msg: " Enter Pincode" })
            }

            if (!(shipping.pincode.toString().length === 6)) {
                return res.status(400).send({ status: false, msg: "Enter Valid Shipping Pincode" })
            }

            if (!validator.isValid(billing.street)) {
                return res.status(400).send({ status: false, msg: " Enter Street Name" })
            }

            if (!validator.isValid(billing.city)) {
                return res.status(400).send({ status: false, msg: " Enter City Name" })
            }

            if (!validator.isValid(billing.pincode)) {
                return res.status(400).send({ status: false, msg: " Enter Pincode" })
            }

            if (!(billing.pincode.toString().length === 6)) {
                return res.status(400).send({ status: false, msg: "Enter Valid billing Pincode" })
            }


        }

        if (password) {
            if (!validator.isValid(data.password)) {
                return res.status(400).send({ status: false, msg: "Enter password" })
            }
            if (!(/^.{8,15}$/).test(data.password)) {
                return res.status(400).send({ status: false, msg: "Password Length should be between 8 and 15" })
            }
            // generate salt to hash password
            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
            data.password = await bcrypt.hash(data.password, salt);
        }


        let emailUsed = await userModel.findOne({ email })
        if (emailUsed) {
            return res.status(400).send({ status: false, msg: "email must be Unique" })
        }

        let phoneUsed = await userModel.findOne({ phone })
        if (phoneUsed) {
            return res.status(400).send({ status: false, msg: "Phone must be Unique" })
        }


        const update = await userModel.findOneAndUpdate({ _id: id }, { $set: data }, { new: true })
       
        update["profileImage"] = uploadedFileURL

        return res.status(200).send({ status: true, msg: "User Profile updated", data: update })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message })
    }
}
module.exports.register = register
module.exports.login = login
module.exports.getProfile = getProfile
module.exports.updateProfile = updateProfile