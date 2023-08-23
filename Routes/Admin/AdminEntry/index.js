const express = require("express")
const { getAllContestEntries,getEntryById,deleteEntry } = require("../../../Controllers/Admin/adminEntryController")
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../../Middlewares/auth")
const {contestValidator} = require("../../../Validator/contestValidator")


router.get("/getAllContestEntries/:id",authenticatedRoute,getAllContestEntries);
router.get("/getEntryById/:id",authenticatedRoute,getEntryById);
router.get("/deleteEntry/:id",authenticatedRoute,deleteEntry);

module.exports = router