//Models
const User = require("../../Models/User");
const Payment = require("../../Models/Payment");

const fs = require("fs");
const stripe = require("stripe")("sk_test_51KHXNgEhqLqdrjwEAPRFFUURiEyMLWajMbOewSENFMkTwoY4dVBpfmQPLpX0AdFgvGky6fUn99RtETYfSVdfcwuP00IqdyPIxL");

//Helpers
const { generateToken } = require("../../Helpers/index");
const { ApiResponse } = require("../../Helpers/index");
const { validateToken } = require("../../Helpers/index");
const { generateString } = require("../../Helpers/index");
const { errorHandler } = require("../../Helpers/errorHandler");
const { generateEmail } = require("../../Helpers/email");
const sanitizeUser = require("../../Helpers/sanitizeUser");
const {
  createResetToken,
  validateResetToken,
} = require("../../Helpers/verification");
const mongoose = require("mongoose");

