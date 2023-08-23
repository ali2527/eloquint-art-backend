//Models
const User = require("../../Models/User");
const Contest = require("../../Models/Contest")
const Entry = require('../../Models/Entry')
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
exports.getAllContestEntries = async (req, res) => {
  const { page = 1, limit = 10, status, from, to, keyword } = req.query;
  const contestId = req.params.id
  try {
    let finalAggregate = [
      {
        $match: {
          contest: new mongoose.Types.ObjectId(contestId),
        },
      },
      {
        $lookup: {
          from: "contests",
          localField: "contest",
          foreignField: "_id",
          as: "contest",
        },
      },
      {
        $unwind: "$contest",
      },
      {
        $lookup: {
          from: "users",
          localField: "contestant",
          foreignField: "_id",
          as: "contestant",
        },
      },
      {
        $unwind: "$contestant",
      },
      {
        $addFields: {
          voted: { $in: [req.user._id, "$votes"] } // Check if userId is in the "votes" array
        }
      }
    ];


    const myAggregate =
      finalAggregate.length > 0
        ? Entry.aggregate(finalAggregate).sort({ createdAt: -1 })
        : Entry.aggregate([]);

    Entry.aggregatePaginate(myAggregate, { page, limit }, (err, entries) => {
      if (err) {
        return res.json(
          ApiResponse(
            {},
            errorHandler(err) ? errorHandler(err) : err.message,
            false
          )
        );
      }
      if (!entries) {
        return res.json(ApiResponse({}, "No entries found", false));
      }

      return res.json(ApiResponse(entries));
    });
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};

//get contest by id
exports.getEntryById = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id).populate("votes");
    if (!entry) {
      return res.json(ApiResponse({}, "No entry found", false));
    }
    return res.json(ApiResponse(entry));
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};

//delete contest
exports.deleteEntry = async (req, res) => {
    try {
      const oldEntry = await Entry.findById(req.params.id).populate("contest");
      if (oldEntry.contest.status !== "FINISHED") {
        return res.json(ApiResponse({}, "Entry cannot be deleted before Contest Finished", false));
      }
      
      const entry = await Entry.findByIdAndDelete(req.params.id);
      if (!entry) {
        return res.json(ApiResponse({}, "No entry found", false));
      }
      
      return res.json(ApiResponse({}, "Entry Deleted Successfully",true));
    } catch (error) {
      return res.json(ApiResponse({}, error.message, false));
    }
  };


