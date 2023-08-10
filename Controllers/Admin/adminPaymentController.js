//Models
const User = require("../../Models/User");
const Contest = require("../../Models/Contest");
const Payment = require("../../Models/Payment")
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

//get all contests with pagination
exports.getAllSubscriptionPayments = async (req, res) => {
  const { page = 1, limit = 10, status, from, to, keyword } = req.query;
  try {
    let finalAggregate = [];

    finalAggregate.push(
      {
        $match: {
          type:"SUBSCRIPTION"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "payee",
          foreignField: "_id",
          as: "payee",
        },
      },
      {
        $unwind: "$payee",
      }
    );

    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            {
              "payee.fullName": {
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

   

    const myAggregate =
      finalAggregate.length > 0
        ? Payment.aggregate(finalAggregate).sort({ createdAt: 1 })
        : Payment.aggregate([]);

    Payment.aggregatePaginate(myAggregate, { page, limit }, (err, payments) => {
      if (err) {
        return res.json(
          ApiResponse(
            {},
            errorHandler(err) ? errorHandler(err) : err.message,
            false
          )
        );
      }
      if (!payments) {
        return res.json(ApiResponse({}, "No payments found", false));
      }

      return res.json(ApiResponse(payments));
    });
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};




exports.getAllContestPayments = async (req, res) => {
  const { page = 1, limit = 10, status, from, to, keyword } = req.query;
  try {
    let finalAggregate = [];

    finalAggregate.push(
      {
        $match: {
          type:"CONTEST"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "payee",
          foreignField: "_id",
          as: "payee",
        },
      },
      {
        $unwind: "$payee",
      }
    );

    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            {
              "payee.fullName": {
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

   

    const myAggregate =
      finalAggregate.length > 0
        ? Payment.aggregate(finalAggregate).sort({ createdAt: 1 })
        : Payment.aggregate([]);

    Payment.aggregatePaginate(myAggregate, { page, limit }, (err, payments) => {
      if (err) {
        return res.json(
          ApiResponse(
            {},
            errorHandler(err) ? errorHandler(err) : err.message,
            false
          )
        );
      }
      if (!payments) {
        return res.json(ApiResponse({}, "No payments found", false));
      }

      return res.json(ApiResponse(payments));
    });
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};
