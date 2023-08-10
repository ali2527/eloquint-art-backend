const express = require("express")
const {  } = require("../../Controllers/Payment");
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../Middlewares/auth")
const {paymentValidator} = require("../../Validator/paymentValidator")


module.exports = router