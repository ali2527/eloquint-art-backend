const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const gallerySchema = new mongoose.Schema({
      image: {
        type: String, // You can store the image URL here
        required: true,
      },
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
        },
      ],
      comments: [
        {
          text: {
            type: String,
            required: true,
          },
          author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
}, {timestamps:true})

gallerySchema.plugin(mongoosePaginate);
gallerySchema.plugin(aggregatePaginate);

module.exports = mongoose.model("entry", gallerySchema)