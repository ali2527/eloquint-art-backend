const { body, validationResult, check } = require('express-validator');
const { ApiResponse } = require("../Helpers")


//add Query Validator
exports.planValidator = [
  body('title').not().isEmpty().withMessage("Title is Required"),
  body('description').not().isEmpty().withMessage("Description is Required"),
  body('durationInDays').not().isEmpty().withMessage("Duration Days are Required"),
  body('price').not().isEmpty().withMessage("Price is Required"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(ApiResponse({}, errors.array()[0].msg, false));
    }
    next()  
  }
]