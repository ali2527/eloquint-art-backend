//Models
const User = require("../../Models/User");

//Helpers
const { generateToken } = require("../../Helpers/index");
const { ApiResponse } = require("../../Helpers/index");
const { validateToken } = require("../../Helpers/index");
const { generateString } = require("../../Helpers/index");
const { errorHandler } = require("../../Helpers/errorHandler");
const { generateEmail } = require("../../Helpers/email");
const sanitizeUser = require("../../Helpers/sanitizeUser");
const fs = require("fs");
const {
  createResetToken,
  validateResetToken,
} = require("../../Helpers/verification");

//get user
exports.getProfile = async (req, res) => {
  try {
    return res
      .status(200)
      .json(ApiResponse(sanitizeUser(req.user), "Found User Details", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

//update user
exports.updateProfile = async (req, res) => {
  try {
    console.log(req.user._id);
    if (req.body.image) {
      let currentUser = await User.findById(req.user._id);

      console.log("current", currentUser);
      if (currentUser.image) {
        fs.unlinkSync(`./Uploads/${currentUser.image}`);
      }
    }

    let user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });
    if (!user) {
      return res.json(ApiResponse({}, "No user found", false));
    }
    return res.json(ApiResponse(user, "User updated successfully"));
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};

//change password
exports.changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;

  try {
    let user = await User.findById(req.user._id);
    if (!user.authenticate(old_password)) {
      return res.json(ApiResponse({}, "Current password is Invalid!", false));
    }

    user.password = new_password;
    await user.save();

    await res
      .status(201)
      .json(ApiResponse({}, "Password Updated Successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
