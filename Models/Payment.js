const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    amount: {
      type: String,
      required: true,
      default: "",
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscription",
    },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "contest",
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    charge_id:{
      type: String,
      required: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["SUBSCRIPTION", "CONTEST"],
      default: "SUBSCRIPTION",
    },
    status:{
      type: String,
      enum: ["PAID", "UNPAID"],
      default: "UNPAID",
    },
    entry_status:{
      type: String,
      enum: ["RECIEVED", "UNRECIEVED","WINNER"],
      default: "UNRECIEVED",
    }
  },
  { timestamps: true }
);

paymentSchema.plugin(mongoosePaginate);
paymentSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("payment", paymentSchema);
