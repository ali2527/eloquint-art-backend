//Models
const Entry = require("../../Models/Entry");
const Payment = require("../../Models/Payment");
const Gallery = require("../../Models/Gallery")
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


exports.addGallery = async (req, res) => {
    let {image} = req.body;
    let userId = req.user._id
  try {

    const gallery = new Gallery({image,author:userId});
  
      await gallery.save();
  
      return res.status(200).json(
        ApiResponse(
          { gallery },
  
          "Image Added Successfully",
          true
        )
      );

  } catch (error) {
    return res.json( ApiResponse( {},errorHandler(error) ? errorHandler(error) : error.message, false));
  }
};

exports.addAdminGallery = async (req, res) => {
  let {image} = req.body;
  let userId = req.user._id
try {

  const gallery = new Gallery({image,author:userId,isAdmin:true});

    await gallery.save();

    return res.status(200).json(
      ApiResponse(
        { gallery },

        "Image Added Successfully",
        true
      )
    );

} catch (error) {
  return res.json( ApiResponse( {},errorHandler(error) ? errorHandler(error) : error.message, false));
}
};

exports.getAllGallery =async (req, res) => {
      const { page = 1, limit = 10 } = req.query;
   
      let myAggregate = Gallery.aggregate([{
        $sort:{
            createdAt : -1
        }
      }]);

      Gallery.aggregatePaginate(myAggregate, { page, limit }).then((gallery) => {
        return res.status(200).send(ApiResponse(gallery));
      });
    
  };


  exports.getAllAdminGallery =async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
 
    let myAggregate = Gallery.aggregate([{
      $match:{
          isAdmin : true
      }
    },{
      $sort:{
          createdAt : -1
      }
    }]);

    Gallery.aggregatePaginate(myAggregate, { page, limit }).then((gallery) => {
      return res.status(200).send(ApiResponse(gallery));
    });
  
};


exports.getMyGallery = async (req, res) => {
    let userId = req.params.id
    try {
        let gallery = await Gallery.find({author:userId})

        if(!gallery){
            return res.json(
                ApiResponse(
                  {},
                 "no images found",
                  false
                )
              );
        }
        return res.json(
            ApiResponse(
              {gallery},
              "",
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

  exports.likeGallery = async (req, res) => {
    const { galleryId } = req.params;
    const userId = req.user._id;
    try {
        const gallery = await Gallery.findById(galleryId);

        if (!gallery) {
            return res.status(404).json(ApiResponse({}, "Gallery not found", false));
          }

          const likedIndex = gallery.likes.indexOf(userId);

          if (likedIndex !== -1) {
            gallery.likes.splice(likedIndex, 1); // Remove userId from likes array
          } else {
            gallery.likes.push(userId); // Add userId to likes array
          }
      
          await gallery.save();
      
          res.status(200).json(ApiResponse({}, "Image Liked", true));
      

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

  exports.commentGallery =async  (req, res) => {
    const { galleryId } = req.params;
    const userId = req.user._id;
    const { text } = req.body;
    try {
        const gallery = await Gallery.findById(galleryId);

        if (!gallery) {
            return res.status(404).json(ApiResponse({}, "Image not found", false));
          }

          const newComment = {
            text,
            author: userId,
          };

          gallery.comments.push(newComment);
          await gallery.save();
      
          res.status(200).json(ApiResponse({newComment}, "Comment Added Successfully", true));

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

  exports.deleteGallery =async  (req, res) => {
    const { galleryId } = req.params;
    try {
        let gallery =await  Gallery.findByIdAndDelete(galleryId)

        if (!gallery) {
            return res.status(404).json(ApiResponse({}, "Image not found", false));
          }

          res.status(200).json(ApiResponse({}, "Image Deleted Successfully", true));

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

  
  exports.deleteAllGallery =async  (req, res) => {

    try {
        let gallery =await  Gallery.deleteMany()


          res.status(200).json(ApiResponse({}, "Image Deleted Successfully", true));

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

