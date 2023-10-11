//Models
const User = require("../../Models/User");
const Payment = require("../../Models/Payment");
const Contest = require("../../Models/Contest");
const Entry = require("../../Models/Entry");
const Plan = require("../../Models/Plan")
const Subscription = require("../../Models/Subscription")

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



//addQuery
exports.contestPayment = async (req, res) => {
  const { contestId, cardNumber, month, year, cvv } = req.body;
  let userId = req.user._id

  try {

    let contest = await Contest.findOne({ _id: contestId });
    if (!contest) {
      return res.status(400).json(ApiResponse({},"Contest not found", false));
    }

    let currentpayment =await Payment.findOne({type:"CONTEST", payee: req.user._id, status: "PAID" })

    if (currentpayment) {
      return res.status(200).json(ApiResponse({},"User has already Paid for in this contest", true));
    }

    let charge = "";
    let token = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month: month,
        exp_year: year,
        cvc: cvv,
      },
    });
    if (token.error) {
      return res.status(400).json(ApiResponse({},token.error, false));
    }
    charge = await stripe.charges.create({
      amount: contest.fee * 100,
      description: "Eloquint Art  ",
      currency: "usd",
      source: token.id,
    });
    console.log("Charges", charge);

    let paymentLog = new Payment({
      contest: contestId,
      charge_id: charge.id ? charge.id : null,
      amount: contest.fee,
      payee: req.user._id ? req.user._id : null,
      type: "CONTEST",
      status: charge.id ? "PAID" : "UNPAID",
    });

    await paymentLog.save();

    if(!charge.id){
      return res.status(400).json(ApiResponse({},"Payment UnSuccessful", false));
    }

    return res.status(200).json(ApiResponse({},"Payment Successful", true));   
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

exports.subscriptionPayment = async (req, res) => {
  
  const {userId, planId, cardNumber, month, year, cvv } = req.body;

  console.log(req.body)

  try {

    let plan = await Plan.findOne({ _id: planId });
    if (!plan) {
      return res.status(400).json(ApiResponse({},"Plan not found", false));
    }

    let currentSubscription =await Subscription.findOne({ customer: userId, status: "ACTIVE" })

    if (currentSubscription) {
      return res.status(400).json(ApiResponse({},"Users Subscription is currently active", false));
    }


    
    let charge = "";
    let token = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month: month,
        exp_year: year,
        cvc: cvv,
      },
    });
    if (token.error) {
      return res.status(400).json(ApiResponse({},token.error, false));
    }

    charge = await stripe.charges.create({
      amount: plan.price * 100,
      description: "Eloquint Art",
      currency: "usd",
      source: token.id,
    });
  
    let subscription = new Subscription({
      customer:userId,
      plan: planId,
      purchaseDate:new Date(),
      expiryDate: new Date(new Date().getTime() + plan.durationInDays * 24 * 60 * 60 * 1000),
      charge_id: charge.id ? charge.id : null,
      amount: plan.price,
      status: charge.id ? "ACTIVE" : "INACTIVE",
    });

    await subscription.save();


    let paymentLog = new Payment({
      subscription: subscription._id,
      charge_id: charge.id ? charge.id : null,
      amount: plan.price,
      payee: userId ? userId : null,
      type: "SUBSCRIPTION",
      status: charge.id ? "PAID" : "UNPAID",
    });

    await paymentLog.save();

    if(!charge.id){
      return res.status(400).json(ApiResponse({},"Payment UnSuccessful", false));
    }

    return res.status(200).json(ApiResponse({},"Payment Successful", true));   
  } catch (error) {
    console.log("error.message",error.message)
    return res.json(
      ApiResponse(
        {},
        error.message  ? error.message :  errorHandler(error) ,
        false
      )
    );
  }
};

exports.getMyPaymentLogs = async (req, res) => {
  const { page = 1, limit = 10, status, from, to, keyword } = req.query;
  try {
    let finalAggregate = [];

    finalAggregate.push(
      {
        $match: {
          type:"SUBSCRIPTION",
        }
      },
      {
        $match: {
          payee:new mongoose.Types.ObjectId(req.user._id),
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
          from: "subscriptions",
          localField: "subscription",
          foreignField: "_id",
          as: "subscription",
        },
      },
      {
        $unwind: "$subscription",
      },
      {
        $lookup: {
          from: "plans",
          localField: "subscription.plan",
          foreignField: "_id",
          as: "subscription.plan",
        },
      },
      {
        $unwind: "$subscription.plan",
      },
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

