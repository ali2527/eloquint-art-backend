const express = require("express")
const {addPost ,getMyPosts , getNewsFeeds , getUserPosts,likePost,lovePost,commentPost} = require("../../Controllers/Post");
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../Middlewares/auth")
const {postValidator} = require("../../Validator/postValidator")
const {uploadMultiple,uploadFile} = require('../../Middlewares/upload')


router.post("/addPost",authenticatedRoute,uploadMultiple,postValidator, addPost);
router.get("/getMyPosts",authenticatedRoute, getMyPosts);
router.get("/getNewsFeeds",authenticatedRoute, getNewsFeeds);
router.get("/getUserPosts/:id",authenticatedRoute, getUserPosts);
router.get("/likePost/:postId",authenticatedRoute, likePost);
router.get("/lovePost/:postId",authenticatedRoute, lovePost);
router.post("/comment/:postId",authenticatedRoute,uploadFile, commentPost);


module.exports = router