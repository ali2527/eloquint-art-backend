const express = require("express")
const {list ,create , remove } = require("../../Controllers/Plan");
const router = express.Router()
const { authenticatedRoute,adminRoute } = require("../../Middlewares/auth")
const {planValidator} = require("../../Validator/planValidator")

router.get("/getAllPlans", list);
router.get("/getPlanById/:id", authenticatedRoute, list);
router.post("/addPlan", authenticatedRoute,planValidator, create);
router.post("/editPlan/:id", authenticatedRoute, create);
router.get("/deletePlan/:id", authenticatedRoute, remove);

module.exports = router