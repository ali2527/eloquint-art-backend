const express = require("express")
const { joinContest,voteContest } = require("../../Controllers/Contest");
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../Middlewares/auth")
const {paymentValidator} = require("../../Validator/paymentValidator")


router.post("/joinContest",addQueryValidator, joinContest);
router.post("/voteContest", authenticatedRoute,voteContest);

module.exports = router