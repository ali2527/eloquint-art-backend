const express = require("express")
const { getAllQueries,getQueryById  } = require("../../../Controllers/Admin/adminQueryController")
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../../Middlewares/auth")


router.get("/getAllQueries",authenticatedRoute,getAllQueries);
router.get("/getQueryById/:id",authenticatedRoute,getQueryById);

module.exports = router