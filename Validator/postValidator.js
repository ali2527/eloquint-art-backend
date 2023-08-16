const { body, validationResult, check } = require('express-validator');
const { ApiResponse } = require("../Helpers")

//add Query Validator
exports.postValidator = [
  body('title').not().isEmpty().withMessage("Post Title is Required"),
  body('content').not().isEmpty().withMessage("Post content is Required"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(ApiResponse({}, errors.array()[0].msg, false));
    }
    next()  
  }
]