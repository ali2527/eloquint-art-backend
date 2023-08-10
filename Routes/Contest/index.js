const express = require("express")
const { joinContest,voteContest } = require("../../Controllers/Contest");
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../Middlewares/auth")
const {uploadFile} = require("../../Middlewares/upload")


router.post("/joinContest",authenticatedRoute,uploadFile, joinContest);
router.post("/voteContest", authenticatedRoute,voteContest);

module.exports = router