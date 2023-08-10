//Models
const User = require("../../Models/User");
const mongoose = require("mongoose");

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

//libraries
const dayjs = require("dayjs");

//modules
const moment = require("moment");

//get user
exports.getAdmin = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.json(ApiResponse({}, "No admin found", false));
    }

    return res
      .status(200)
      .json(ApiResponse(sanitizeUser(user), "Found Admin Details", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

//get all users with pagination
exports.getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, status, from, to, keyword } = req.query;
  try {
    let finalAggregate = [];

    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            {
              fullName: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              email: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
          ],
        },
      });
    }

    if (status) {
      finalAggregate.push({
        $match: {
          status: req.query.status,
        },
      });
    }

    if (from) {
      finalAggregate.push({
        $match: {
          createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment(new Date()).endOf("day").toDate(),
          },
        },
      });
    }

    if (to) {
      finalAggregate.push({
        $match: {
          createdAt: {
            $lte: moment(to).endOf("day").toDate(),
          },
        },
      });
    }

    finalAggregate.push({
      $project: {
        salt: 0,
        hashed_password: 0,
      },
    });

    const myAggregate =
      finalAggregate.length > 0
        ? User.aggregate(finalAggregate).sort({ firstName: 1 })
        : User.aggregate([]);

    User.aggregatePaginate(myAggregate, { page, limit }, (err, users) => {
      if (err) {
        return res.json(
          ApiResponse(
            {},
            errorHandler(err) ? errorHandler(err) : err.message,
            false
          )
        );
      }
      if (!users || users.docs.length == 0) {
        return res.json(ApiResponse({}, "No students found", false));
      }

      return res.json(ApiResponse(users));
    });
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};

//get user by id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.json(ApiResponse({}, "No user found", false));
    }
    return res.json(ApiResponse(user));
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};

//update user
exports.updateUser = async (req, res) => {
  try {
    if (req.body.image) {
      let currentUser = await User.findById(req.params.id);
      if (currentUser.image) {
        fs.unlinkSync(`./Uploads/${currentUser.image}`);
      }
    }

    let user = await User.findByIdAndUpdate(req.params.id, req.body, {
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
