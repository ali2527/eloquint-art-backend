const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const entrySchema = new mongoose.Schema({
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contest',
        required: true,
      },
      image: {
        type: String, // You can store the image URL here
        required: true,
      },
      votes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
        },
      ],
}, {timestamps:true})

entrySchema.plugin(mongoosePaginate);
entrySchema.plugin(aggregatePaginate);

module.exports = mongoose.model("entry", entrySchema)