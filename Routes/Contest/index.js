const express = require("express")
const { joinContest,voteContest,getAllMyContests } = require("../../Controllers/Contest");
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../Middlewares/auth")
const {uploadFile} = require("../../Middlewares/upload")

router.get("/getAllMyContests",authenticatedRoute, getAllMyContests);
router.post("/joinContest",authenticatedRoute,uploadFile, joinContest);
router.post("/voteContest", authenticatedRoute,voteContest);

module.exports = router