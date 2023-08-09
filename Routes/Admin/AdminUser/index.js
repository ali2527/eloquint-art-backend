const express = require("express")
const { getAdmin ,getAllStudents,getAllCoaches,getAllTutors,getStudentById,getCoachById,updateStudent,updateCoach } = require("../../../Controllers/Admin/adminUserController")
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../../Middlewares/auth")
const {uploadFile} = require("../../../Middlewares/upload")

router.get("/",authenticatedRoute,getAdmin);
router.get("/getAllStudents",authenticatedRoute,getAllStudents);
router.get("/getAllCoaches",getAllCoaches);
router.get("/getAllTutors",getAllTutors);
router.get("/getStudentById/:id",authenticatedRoute,getStudentById);
router.get("/getCoachById/:id",getCoachById);
router.post("/updateStudent/:id",authenticatedRoute,uploadFile,updateStudent);
router.post("/updateCoach/:id",authenticatedRoute,uploadFile,updateCoach);


module.exports = router