const User = require("../../Models/User");
const Contest = require("../../Models/Contest");
const Query = require("../../Models/Query")
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

exports.getQueryById = async (req, res) => {
    try {
      let query = await Query.findOne({ _id: req.params.id })
        .populate("user")
        .lean();
      if (!query)
        return res.status(400).json({ message: "query Detail not found" });
  
      return res.status(200).json(query);
    } catch (err) {
      res.status(500).json({
        message: err.toString(),
      });
    }
  };
  
  exports.getAllQueries = (req, res) => {
    const { page = 1, limit = 10, status, from, to, keyword } = req.query;
  
    let finalAggregate = [];
  
    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            {
              message: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              name: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              subject: {
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
  
    let myAggregate =
      finalAggregate.length > 0
        ? Query.aggregate(finalAggregate)
        : Query.aggregate([]);
  
    console.log(finalAggregate);
  
    Query.aggregatePaginate(myAggregate, { page, limit }).then((query) => {
      return res.status(200).send(query);
    });
  };