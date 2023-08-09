const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    title: {
      type: String,
      required:true,
      default: "",
    },
    content: {
        type: String,
        required:false,
        default: "",
      },
      assignee: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "recieverType",
      },
      recieverType: {
        type: String,
        enum: ["user", "coach"],
      },
    type:{
        type:String,
        enum:["ALERT","ANNOUNCEMENT","NOTIFICATION"],
        default:"NOTIFICATION"
    }
  },
  { timestamps: true }
);

notificationSchema.plugin(mongoosePaginate);
notificationSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("notification", notificationSchema);
