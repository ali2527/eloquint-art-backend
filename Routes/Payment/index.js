const express = require("express")
const { lessonPayment,getMyPayments,createCharge } = require("../../Controllers/Payment");
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../Middlewares/auth")
const {paymentValidator} = require("../../Validator/paymentValidator")

router.post("/createCharge", createCharge);

// router.post("/lessonPayment",authenticatedRoute,paymentValidator, lessonPayment);
// router.get("/getMyPayments",authenticatedRoute,getMyPayments)

module.exports = router