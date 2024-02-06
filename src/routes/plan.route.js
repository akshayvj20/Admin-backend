const {Router} = require("express");
const PlanController = require("../modules/plan/plan.controller");


const router = Router();

//get all plan
router.get("/",PlanController.getPlan);

//creating new plan
router.post('/create',PlanController.createPlan);

module.exports = router;