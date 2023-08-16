//Models
const Post = require("../../Models/Post");
const fs = require("fs");

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
const { default: mongoose } = require("mongoose");

//addPost
exports.addPost = async (req, res) => {
  const { title, content } = req.body;
  const { image, video } = req.files;
  try {
    let imagesArr = image ? image.map((item) => item?.path) : [];
    let videosArr = video ? video.map((item) => item?.path) : [];

    const post = new Post({
      title,
      content,
      author: req.user._id,
      images: imagesArr,
      videos: videosArr,
    });

    await post.save();

    return res.status(200).json(
      ApiResponse(
        { post },

        "Post Created Successfully",
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

// exports.getMyPosts = async (req, res) => {
//   const userId = req.user._id;
//   const page = parseInt(req.query.page) || 1;
//   const perPage = parseInt(req.query.limit) || 10;

//   try {
//     // Get paginated posts
//     const posts = await Post.aggregate([
//       {
//         $match: { author: mongoose.Types.ObjectId(userId) },
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $skip: (page - 1) * perPage,
//       },
//       {
//         $limit: perPage,
//       },
//       {
//         $lookup: {
//           from: 'users', // Replace with the correct collection name for users
//           localField: 'author',
//           foreignField: '_id',
//           as: 'author',
//         },
//       },
//       {
//         $unwind: '$author',
//       },
//       {
//         $addFields: {
//           liked: { $in: [userId, '$likes'] },
//           loved: { $in: [userId, '$loves'] },
//         },
//       },
//     ]);

//     // Get all comments with author information
//     const allComments = await Post.aggregate([
//       {
//         $match: { author: mongoose.Types.ObjectId(userId) },
//       },
//       {
//         $unwind: '$comments',
//       },
//       {
//         $lookup: {
//           from: 'users', // Replace with the correct collection name for users
//           localField: 'comments.author',
//           foreignField: '_id',
//           as: 'comments.author',
//         },
//       },
//       {
//         $unwind: '$comments.author',
//       },
//       {
//         $addFields: {
//           'comments.liked': { $in: [userId, '$comments.likes'] },
//           'comments.loved': { $in: [userId, '$comments.loves'] },
//         },
//       },
//       {
//         $group: {
//           _id: '$_id',
//           comments: { $push: '$comments' },
//         },
//       },
//     ]);

//     // Merge comments into respective posts
//     const mergedPosts = posts.map((post) => {
//       const matchingComments = allComments.find((c) => c._id.equals(post._id));
//       if (matchingComments) {
//         post.comments = matchingComments.comments.sort((a, b) => b.createdAt - a.createdAt);
//       }
//       return post;
//     });

//     const totalCount = await Post.countDocuments({ author: userId });

//     res.status(200).json(
//       ApiResponse(
//         { posts: mergedPosts, totalCount },
//         '',
//         true
//       )
//     );
//   } catch (error) {
//     res.status(500).json(ApiResponse({}, 'Internal Server Error', false));
//   }
// };

exports.getMyPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.limit) || 10;

  try {
    const userId = req.user._id;

    // Get paginated posts
    const posts = await Post.aggregate([
      {
        $match: { author: userId },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
      {
        $lookup: {
          from: "users", // Replace with the correct collection name for users
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $addFields: {
          liked: { $in: [userId, "$likes"] },
          loved: { $in: [userId, "$loves"] },
        },
      },
    ]);

    // Get all comments
    const allComments = await Post.aggregate([
      {
        $unwind: "$comments",
      },
      {
        $lookup: {
          from: "users", // Replace with the correct collection name for users
          localField: "comments.author",
          foreignField: "_id",
          as: "comments.author",
        },
      },
      {
        $unwind: "$comments.author",
      },
      {
        $addFields: {
          "comments.liked": { $in: [userId, "$comments.likes"] },
          "comments.loved": { $in: [userId, "$comments.loves"] },
        },
      },
      {
        $group: {
          _id: "$_id",
          comments: { $push: "$comments" },
        },
      },
    ]);

    // Merge comments into respective posts
    const mergedPosts = posts.map((post) => {
      const matchingComments = allComments.find((c) => c._id.equals(post._id));
      if (matchingComments) {
        post.comments = matchingComments.comments.sort(
          (a, b) => b.createdAt - a.createdAt
        );
      }
      return post;
    });

    const totalCount = await Post.countDocuments();

    res
      .status(200)
      .json(ApiResponse({ posts: mergedPosts, totalCount }, "", true));
  } catch (error) {
    res.status(500).json(ApiResponse({}, "Internal Server Error", false));
  }
};

exports.getNewsFeeds = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.limit) || 10;

  try {
    const userId = req.user._id;

    // Get paginated posts
    const posts = await Post.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
      {
        $lookup: {
          from: "users", // Replace with the correct collection name for users
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $addFields: {
          liked: { $in: [userId, "$likes"] },
          loved: { $in: [userId, "$loves"] },
        },
      },
    ]);

    // Get all comments
    const allComments = await Post.aggregate([
      {
        $unwind: "$comments",
      },
      {
        $lookup: {
          from: "users", // Replace with the correct collection name for users
          localField: "comments.author",
          foreignField: "_id",
          as: "comments.author",
        },
      },
      {
        $unwind: "$comments.author",
      },
      {
        $addFields: {
          "comments.liked": { $in: [userId, "$comments.likes"] },
          "comments.loved": { $in: [userId, "$comments.loves"] },
        },
      },
      {
        $group: {
          _id: "$_id",
          comments: { $push: "$comments" },
        },
      },
    ]);

    // Merge comments into respective posts
    const mergedPosts = posts.map((post) => {
      const matchingComments = allComments.find((c) => c._id.equals(post._id));
      if (matchingComments) {
        post.comments = matchingComments.comments.sort(
          (a, b) => b.createdAt - a.createdAt
        );
      }
      return post;
    });

    const totalCount = await Post.countDocuments();

    res
      .status(200)
      .json(ApiResponse({ posts: mergedPosts, totalCount }, "", true));
  } catch (error) {
    res.status(500).json(ApiResponse({}, "Internal Server Error", false));
  }
};

exports.getUserPosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.limit) || 10;
  
    try {
      const userId = req.params.id;
  
      // Get paginated posts
      const posts = await Post.aggregate([
        {
          $match: { author: new mongoose.Types.ObjectId(userId) },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: (page - 1) * perPage,
        },
        {
          $limit: perPage,
        },
        {
          $lookup: {
            from: "users", // Replace with the correct collection name for users
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: "$author",
        },
        {
          $addFields: {
            liked: { $in: [userId, "$likes"] },
            loved: { $in: [userId, "$loves"] },
          },
        },
      ]);
  
      // Get all comments
      const allComments = await Post.aggregate([
        {
          $unwind: "$comments",
        },
        {
          $lookup: {
            from: "users", // Replace with the correct collection name for users
            localField: "comments.author",
            foreignField: "_id",
            as: "comments.author",
          },
        },
        {
          $unwind: "$comments.author",
        },
        {
          $addFields: {
            "comments.liked": { $in: [userId, "$comments.likes"] },
            "comments.loved": { $in: [userId, "$comments.loves"] },
          },
        },
        {
          $group: {
            _id: "$_id",
            comments: { $push: "$comments" },
          },
        },
      ]);
  
      // Merge comments into respective posts
      const mergedPosts = posts.map((post) => {
        const matchingComments = allComments.find((c) => c._id.equals(post._id));
        if (matchingComments) {
          post.comments = matchingComments.comments.sort(
            (a, b) => b.createdAt - a.createdAt
          );
        }
        return post;
      });
  
      const totalCount = await Post.countDocuments();
  
      res
        .status(200)
        .json(ApiResponse({ posts: mergedPosts, totalCount }, "", true));
    } catch (error) {
      res.status(500).json(ApiResponse({}, "Internal Server Error", false));
    }
  };
  

exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json(ApiResponse({}, "Post not found", false));
    }

    const likedIndex = post.likes.indexOf(userId);

    if (likedIndex !== -1) {
      post.likes.splice(likedIndex, 1); // Remove userId from likes array
    } else {
      post.likes.push(userId); // Add userId to likes array
    }

    await post.save();

    res.status(200).json(ApiResponse({}, "Post Liked", true));
  } catch (error) {
    res.status(500).json(ApiResponse({}, "Internal Server Error", false));
  }
};

exports.lovePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json(ApiResponse({}, "Post not found", false));
    }

    const lovedIndex = post.loves.indexOf(userId);

    if (lovedIndex !== -1) {
      post.loves.splice(lovedIndex, 1); // Remove userId from loves array
    } else {
      post.loves.push(userId); // Add userId to loves array
    }

    await post.save();

    res.status(200).json(ApiResponse({}, "Post Loved", true));
  } catch (error) {
    res.status(500).json(ApiResponse({}, "Internal Server Error", false));
  }
};

exports.commentPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const { text, image } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      if (image) {
        fs.unlinkSync(`./Uploads/${image}`);
      }
      return res.status(404).json(ApiResponse({}, "Post not found", false));
    }

    const newComment = {
      text,
      author: userId,
      image: image || null,
    };

    post.comments.push(newComment);
    await post.save();

    res.status(200).json(ApiResponse({newComment}, "Comment Added Successfully", true));
  } catch (error) {
    res.status(500).json(ApiResponse({}, "Internal Server Error", false));
  }
};
