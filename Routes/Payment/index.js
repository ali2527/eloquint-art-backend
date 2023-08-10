const express = require("express")
const {contestPayment,subscriptionPayment,getMyPaymentLogs  } = require("../../Controllers/Payment");
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../Middlewares/auth")
const {paymentValidator} = require("../../Validator/paymentValidator")

router.post("/contestPayment",addQueryValidator, contestPayment);
router.post("/subscriptionPayment", authenticatedRoute,subscriptionPayment);
router.post("/getMyPaymentLogs", authenticatedRoute,getMyPaymentLogs);


module.exports = router