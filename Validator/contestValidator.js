const { body, validationResult, check } = require('express-validator');
const { ApiResponse } = require("../Helpers")

//add Query Validator
exports.contestValidator = [
  body('title').not().isEmpty().withMessage("Contest Title is Required"),
  body('fee').not().isEmpty().withMessage("Contest Fee is Required"),
  body('prize').not().isEmpty().withMessage("Contest Prize is Required"),
  body('startDate').not().isEmpty().withMessage("Start Date is Required"),
  body('endDate').not().isEmpty().withMessage("End Date is Required"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(ApiResponse({}, errors.array()[0].msg, false));
    }
    next()  
  }
]