const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Assuming you have a 'user' schema
      required: true,
    },
    images: [
      {
        type: String,
        required: false,
      },
    ],
    videos: [
      {
        type: String,
        required: false,
      },
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    loves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
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
          ref: "user",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        image:{
          type: String,
          required: false,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
          },
        ],
        loves: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
          },
        ],
      },
    ],
  },
  { timestamps: true }
);


postSchema.plugin(mongoosePaginate);
postSchema.plugin(aggregatePaginate);


module.exports = Post = mongoose.model("post", postSchema);
