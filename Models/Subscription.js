const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const SubscriptionSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "plan",
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["ACTIVE","INACTIVE","EXPIRED"],
    default: "ACTIVE",
    },
    amount: {
      type: Number,
      required:true
    },
    is_paid:{
      type:Boolean,
      default:false
    }
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.plugin(mongoosePaginate);
SubscriptionSchema.plugin(aggregatePaginate);


SubscriptionSchema.pre('find', function() {
  this.populate('plan');
});


SubscriptionSchema.pre("save", async function (next) {
  try {
    const plan = await mongoose.model("plan").findById(this.plan);
    if (!plan) {
      throw new Error("Plan not found");
    }
    this.amount = plan.price;
    const expiryDate = new Date(this.purchaseDate.getTime() + plan.durationInDays * 24 * 60 * 60 * 1000);
    this.expiryDate = expiryDate;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = Subscription = mongoose.model(
  "subscription",
  SubscriptionSchema
);
