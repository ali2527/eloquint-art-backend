//Models
const User = require("../../Models/User");
const Contest = require("../../Models/Contest")
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

//get contest
exports.createContest = async (req, res) => {
    const { title, fee, prize, startDate, endDate, description } = req.body;
  try {
    // Check if the student exists
    const existingContest = await Contest.findOne({title});
    if (existingContest) {
      return res.json(ApiResponse({}, "Contest with this Title Already Exists", false));
    }

       // Save the lesson
    const contest = new Contest({
      title,
      fee,
      prize,
      startDate,
      endDate,
      description,
    });

    await contest.save();

    return res
      .status(200)
      .json(ApiResponse({ contest }, "Contest Created Successfully", true));
  } catch (error) {
    return res.json(
      ApiResponse(
        {},
        errorHandler(error) ? errorHandler(error) : error.message,
        false
      )
    );
  }
};

//update contest
exports.updateContest = async (req, res) => {
    try {
      let contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!contest) {
        return res.json(ApiResponse({}, "No contest found", false));
      }


      
      return res.json(ApiResponse(contest, "Contest updated successfully"));
    } catch (error) {
      return res.json(ApiResponse({}, error.message, false));
    }
  };

  //update contest
exports.selectWinner = async (req, res) => {
  let userId = req.body.userId
  try {
    let contest = await Contest.findByIdAndUpdate(req.params.id, {winner:userId}, {
      new: true,
    });
    if (!contest) {
      return res.json(ApiResponse({}, "No contest found", false));
    }

    contest.status = "FINISHED"
    await contest.save()

    let payment = await Payment.findOne({contest:req.params.id,payee:userId,status:"PAID"})

    payment.entry_status = "WINNER"

      await payment.save()

    return res.json(ApiResponse(contest, "Winner Selected successfully"));
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};


//get all contests with pagination
exports.getAllContests = async (req, res) => {
  const { page = 1, limit = 10, status, from, to, keyword } = req.query;
  try {
    let finalAggregate = [];

    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            {
              title: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              description: {
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
          startDate: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment(new Date()).endOf("day").toDate(),
          },
        },
      });
    }

    if (to) {
      finalAggregate.push({
        $match: {
          endDate: {
            $lte: moment(to).endOf("day").toDate(),
          },
        },
      });
    }

   

    const myAggregate =
      finalAggregate.length > 0
        ? Contest.aggregate(finalAggregate).sort({ firstName: 1 })
        : Contest.aggregate([]);

    Contest.aggregatePaginate(myAggregate, { page, limit }, (err, contests) => {
      if (err) {
        return res.json(
          ApiResponse(
            {},
            errorHandler(err) ? errorHandler(err) : err.message,
            false
          )
        );
      }
      if (!contests) {
        return res.json(ApiResponse({}, "No contests found", false));
      }

      return res.json(ApiResponse(contests));
    });
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};

//get contest by id
exports.getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.json(ApiResponse({}, "No contest found", false));
    }
    return res.json(ApiResponse(contest));
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};

//delete contest
exports.deleteContest = async (req, res) => {
    try {
      const oldContest = await Contest.findById(req.params.id);
      if (oldContest.status !== "FINISHED") {
        return res.json(ApiResponse({}, "Contest cannot be deleted before Finished", false));
      }
      
      const contest = await Contest.findByIdAndDelete(req.params.id);
      if (!contest) {
        return res.json(ApiResponse({}, "No contest found", false));
      }
      
      return res.json(ApiResponse({}, "Contest Deleted Successfully",true));
    } catch (error) {
      return res.json(ApiResponse({}, error.message, false));
    }
  };


