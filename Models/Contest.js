const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
      },
      fee: {
        type: Number,
        required: true,
      },
      prize: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: false,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        enum: ['UPCOMING', 'LIVE', 'FINISHED'],
        default: 'UPCOMING',
      },
      winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Assuming you have a 'User' schema for the winner
      },
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Assuming you have a 'User' schema for the winner
      }],
}, {timestamps:true})

contestSchema.plugin(mongoosePaginate);
contestSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("contest", contestSchema)