const { body, validationResult, check } = require('express-validator');
const { ApiResponse } = require("../Helpers")


//add Query Validator
exports.paymentValidator = [
  body('lesson').not().isEmpty().withMessage("LessonId is Required"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(ApiResponse({}, errors.array()[0].msg, false));
    }
    next()  
  }
]