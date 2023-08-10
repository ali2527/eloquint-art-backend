const express = require("express")
const { getAllSubscriptionPayments ,getAllContestPayments } = require("../../../Controllers/Admin/adminPaymentController")
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../../Middlewares/auth")


router.get("/getAllSubscriptionPayments",authenticatedRoute,getAllSubscriptionPayments);
router.get("/getAllContestPayments",authenticatedRoute,getAllContestPayments);

module.exports = router