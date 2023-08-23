const { body, validationResult, check } = require('express-validator');
const { ApiResponse } = require("../Helpers")


//add Query Validator
exports.paymentValidator = [
  body('cardNumber').not().isEmpty().withMessage("Card Number is Required"),
  body('month').not().isEmpty().withMessage("Expiry Month is Required"),
  body('year').not().isEmpty().withMessage("Expiry Year is Required"),
  body('cvv').not().isEmpty().withMessage("Card Cvv is Required"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(ApiResponse({}, errors.array()[0].msg, false));
    }
    next()  
  }
]