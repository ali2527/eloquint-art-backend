const express = require("express")
const { getAdmin ,getAllUsers,getUserById,updateUser } = require("../../../Controllers/Admin/adminUserController")
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../../Middlewares/auth")
const {uploadFile} = require("../../../Middlewares/upload")

router.get("/",authenticatedRoute,getAdmin);
router.get("/getAllUsers",authenticatedRoute,getAllUsers);
router.get("/getUserById/:id",authenticatedRoute,getUserById);
router.post("/updateUser/:id",authenticatedRoute,uploadFile,updateUser);

module.exports = router