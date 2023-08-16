const express = require("express")
const { createContest ,updateContest,getAllContests,getContestById,deleteContest } = require("../../../Controllers/Admin/adminContestController")
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../../Middlewares/auth")
const {contestValidator} = require("../../../Validator/contestValidator")



router.post("/createContest",authenticatedRoute,contestValidator,createContest);
router.post("/updateContest/:id",authenticatedRoute,updateContest);
router.get("/getAllContests",getAllContests);
router.get("/getContestById/:id",getContestById);
router.post("/deleteContest/:id",authenticatedRoute,deleteContest);

module.exports = router