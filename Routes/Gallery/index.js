const express = require("express")
const { addGallery,getMyGallery,likeGallery,commentGallery,deleteGallery,getAllGallery,addAdminGallery,getAllAdminGallery,deleteAllGallery } = require("../../Controllers/Gallery");
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../Middlewares/auth")
const {uploadFile} = require("../../Middlewares/upload")


router.post("/addGallery",authenticatedRoute,uploadFile, addGallery);
router.get("/getMyGallery/:id",authenticatedRoute, getMyGallery);
router.get("/getAllGallery", getAllGallery);
router.get("/likeGallery/:galleryId",authenticatedRoute, likeGallery);
router.post("/commentGallery/:galleryId",authenticatedRoute, commentGallery);
router.get("/deleteGallery/:galleryId", authenticatedRoute,deleteGallery);
router.get("/deleteAllGallery", deleteAllGallery);

module.exports = router