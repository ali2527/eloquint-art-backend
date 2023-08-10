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



//addQuery
exports.joinContest = async (req, res) => {
    const { contestId, image } = req.body;
    try {

      let contest = Payment.findById(contestId)

      if(!contest){
        return res.status(200).json(ApiResponse({},"Contest Not Found",false));
      }
      
      let payment = Payment.findOne({contest:contestId,payee:req.user._id,status:"PAID"})

      if(!payment){
        return res.status(200).json(ApiResponse({},"Contest Payment Not Found",false));
      }

      const entry = new Entry({
        contestId,
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


    let entry = Entry.findById(entryId)

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