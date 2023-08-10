//Models
const Entry = require("../../Models/Entry");
const Query = require("../../Models/Query");
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



//addQuery
exports.joinContest = async (req, res) => {
    const { contestId, image } = req.body;
  
    try {

      let subscriptionData = await Subscription.findOne({ _id: subscription });
    console.log("subscriptionData", subscriptionData);
    if (!subscriptionData) {
      throw new Error("Subscription doesnot Exist");
    }
    if (subscriptionData.is_paid) {
      return res.status(400).json({ message: "Subscription Already Paid" });
    }
    let charge = "";
    let m = card_expiry.split("/");
    let cardNumber = card_number;
    let token = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month: m[0],
        exp_year: m[1],
        cvc: card_cvv,
      },
    });
    if (token.error) {
      // throw new Error (token.error);
      return res.status(400).json({ message: token.error });
    }
    charge = await stripe.charges.create({
      amount: subscriptionData.subscriptionprice * 100,
      description: "Truth Out  ",
      currency: "usd",
      source: token.id,
    });
    console.log("Charges", charge);
    let paymentLog = new Payment({
      subscription: subscription,
      charge_id: charge.id ? charge.id : null,
      amount: subscriptionData.subscriptionprice,
      user: req.user._id ? req.user._id : null,
      type: payment_type,
      status: charge.id ? "paid" : "unpaid",
    });
    await paymentLog.save();
    subscriptionData.is_paid = true;
    await subscriptionData.save();
    res.status(200).json({
      message: "Payment Successfully Paid",
      subscription: subscriptionData,
    });

    
      const entry = new Entry({
        contestId,
        image,
      });
  
      await entry.save();
  
      return res.status(200).json(
        ApiResponse(
          { entry },
          
          "Joined Contest Successfully",
          true
        )
      );
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