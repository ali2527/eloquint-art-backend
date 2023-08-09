//Models
const User = require("../../Models/User");
const Coach = require("../../Models/Coach");
const Lesson = require("../../Models/Lesson");
const Payment = require("../../Models/Payment");
const Commission = require("../../Models/Commission");
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

exports.lessonPayment = async (req, res) => {
  try {
    // Check if the student exists

    const existingLesson = await Lesson.findById(lesson);

    if (!existingLesson) {
      return res.json(ApiResponse({}, "Lesson not Found", false));
    }

    const existingPayment = await Payment.findOne({
      lesson: req.body.lesson,
      payee: req.user._id,
    });

    if (existingPayment) {
      return res.json(ApiResponse({}, "Payment Already made", false));
    }
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

exports.getAllLessons = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    let user = await User.exists({ _id: req.user.id });
    let coach = await Coach.exists({ _id: req.user.id });

    let finalAggregate = [];

    if (user) {
      finalAggregate.push(
        {
          $match: {
            student: new mongoose.Types.ObjectId(req.user._id),
          },
        },
        {
          $lookup: {
            from: "coaches",
            localField: "coach",
            foreignField: "_id",
            as: "coach",
          },
        },
        {
          $unwind: "$coach",
        }
      );
    } else if (coach) {
      finalAggregate.push(
        {
          $match: {
            coach: new mongoose.Types.ObjectId(req.user._id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "student",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: "$student",
        }
      );
    }

    if (req.query.status) {
      finalAggregate.push({
        $match: {
          status: req.query.status,
        },
      });
    }

    const myAggregate =
      finalAggregate.length > 0
        ? Lesson.aggregate(finalAggregate)
        : Lesson.aggregate([]);

    Lesson.aggregatePaginate(myAggregate, { page, limit }).then((lessons) => {
      res.json(ApiResponse(lessons));
    });
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};


exports.createCharge = async (req, res) => {
    const { paymentMethodId } = req.body;
    const amount = 1000; // Set the amount as required
  
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "usd",
            payment_method: paymentMethodId,
            confirm: true,
            transfer_group: "TRANSFER_GROUP_1"
          });

          console.log(paymentIntent)
      
        //   // Retrieve the charge ID from the payment intent
        //   const chargeId = paymentIntent.charges.data[0].id;
  
      // Create a transfer
    //   const transfer = await stripe.transfers.create({
    //     amount:20,
    //     currency: "usd",
    //     destination: "acct_1NPmhxIMDgmkSTwO", // Replace with the destination account ID
    //     transfer_group: "TRANSFER_GROUP_1", // Replace with your transfer group ID
    //   });
  
      // Handle the success response
      res.sendStatus(200);
    } catch (error) {
      console.error("Error processing payment:", error);
      res.sendStatus(500);
    }
  }
    
