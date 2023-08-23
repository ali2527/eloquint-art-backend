const express = require("express")
const {contestPayment,subscriptionPayment,getMyPaymentLogs  } = require("../../Controllers/Payment");
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../Middlewares/auth")
const {paymentValidator} = require("../../Validator/paymentValidator")

router.post("/contestPayment",authenticatedRoute,paymentValidator, contestPayment);
router.post("/subscriptionPayment", paymentValidator,subscriptionPayment);
router.get("/getMyPaymentLogs", authenticatedRoute,getMyPaymentLogs);


module.exports = router