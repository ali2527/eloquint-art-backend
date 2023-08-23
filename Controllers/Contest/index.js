//Models
const Entry = require("../../Models/Entry");
const Payment = require("../../Models/Payment");
const Contest = require("../../Models/Contest")
const fs = require("fs")

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




//get all contests with pagination
exports.getAllMyContests = async (req, res) => {
  const { page = 1, limit = 10, status, from, to, keyword } = req.query;
  try {
    let finalAggregate = [];

    finalAggregate.push({
      $match:{
        payee:req.user._id
      }
    },
    {
      $match:{
        type:"CONTEST"
      }
    },
    {
      $match:{
        status:"PAID"
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
    })

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
        ? Payment.aggregate(finalAggregate).sort({ createdAt: -1 })
        : Payment.aggregate([]);

    Payment.aggregatePaginate(myAggregate, { page, limit }, (err, contests) => {
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


//addQuery
exports.joinContest = async (req, res) => {
    const { contestId, image } = req.body;
    try {

      let contest = Payment.findById(contestId)

      if(!contest){
        return res.status(200).json(ApiResponse({},"Contest Not Found",false));
      }
      
      let payment =await Payment.findOne({contest:contestId,payee:req.user._id,status:"PAID"})

      if(!payment){
        return res.status(200).json(ApiResponse({},"Contest Payment Not Found",false));
      }

      let existingEntry =await Entry.findOne({contest:contestId,contestant:req.user._id})

      if(existingEntry){
        return res.status(200).json(ApiResponse({},"Submission already Made",false));
      }


      payment.entry_status = "RECIEVED"

      await payment.save()

      const entry = new Entry({
        contest :contestId,
        contestant:req.user._id,
        image,
      });
  
      await entry.save();
  
      return res.status(200).json(ApiResponse({ entry },"Joined Contest Successfully",true));
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

  
//addQuery
exports.voteContest = async (req, res) => {
  const { entryId } = req.body;
  const userId = req.user._id;
  try {


    let entry =await Entry.findById(entryId)

      if(!entry){
        return res.status(200).json(ApiResponse({},"Entry Not Found",false));
      }

      if (entry.votes.includes(userId)) {
        return res.status(400).json({ message: 'User has already voted for this entry' });
      }

      entry.votes.push(userId);
      await entry.save();
  
    return res.status(200).json(ApiResponse({  },"Entry Voted Successfully",true));
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