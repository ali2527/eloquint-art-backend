//Models
const User = require("../../Models/User");
const Coach = require("../../Models/Coach");
const Rate = require("../../Models/Rates");
const Schedule = require("../../Models/Schedule")
const Review = require("../../Models/Review")
const mongoose = require("mongoose");

//Helpers
const { generateToken } = require("../../Helpers/index");
const { ApiResponse } = require("../../Helpers/index");
const { validateToken } = require("../../Helpers/index");
const { generateString } = require("../../Helpers/index");
const { errorHandler } = require("../../Helpers/errorHandler");
const { generateEmail } = require("../../Helpers/email");
const  sanitizeUser = require("../../Helpers/sanitizeUser");
const fs = require("fs");
const {
  createResetToken,
  validateResetToken,
} = require("../../Helpers/verification");

//libraries
const dayjs = require("dayjs");

//modules
const moment = require("moment");


//get user
exports.getAdmin = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.json(ApiResponse({}, "No admin found", false));
    }

    return res
      .status(200)
      .json(ApiResponse(sanitizeUser(user), "Found Admin Details", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message,false));
  }
};

function roundToHalf(num) {
  return Math.round(num * 2) / 2;
}


    
//get all students with pagination
exports.getAllStudents = async (req, res) => {
  const { page = 1, limit = 10, status, from, to, keyword } = req.query;
  try {
    let finalAggregate = [];

    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            {
              firstName: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              lastName: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              email: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
          ],
        },
      });
    }

    if (status) {
      finalAggregate.push({
        $match: {
          status: req.query.status,
        },
      });
    }

    if (from) {
      finalAggregate.push({
        $match: {
          createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment(new Date()).endOf("day").toDate(),
          },
        },
      });
    }

    if (to) {
      finalAggregate.push({
        $match: {
          createdAt: {
            $lte: moment(to).endOf("day").toDate(),
          },
        },
      });
    }

    finalAggregate.push({
      $project: {
        salt: 0,
        hashed_password: 0,
      },
    });

    const myAggregate =

      finalAggregate.length > 0
        ? User.aggregate(finalAggregate).sort({ firstName: 1 })
        : User.aggregate([]);

    User.aggregatePaginate(myAggregate, { page, limit }, (err, users) => {
      if (err) {
        return res.json(
          ApiResponse(
            {},
            errorHandler(err) ? errorHandler(err) : err.message,
            false
          )
        );
      }
      if (!users || users.docs.length == 0){
        return res.json(ApiResponse({}, "No students found", false));
      }

      return res.json(ApiResponse(users));
    }
    );
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};



exports.getAllCoaches = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    from,
    to,
    keyword,
    maxHourlyRate,
    minHourlyRate,
    subjects,
    daysToFilter,
  } = req.query;

  try {
    let finalAggregate = [];

    finalAggregate.push({
      $lookup: {
        from: "rates",
        localField: "_id",
        foreignField: "coach",
        as: "rate",
      },
    });

    finalAggregate.push({
      $match: {
        applicationType: { $in: ["BOTH", "COACHING"] },
      },
    });

    finalAggregate.push({
      $project: {
        salt: 0,
        hashed_password: 0,
      },
    });

    // Filter by keyword if provided
    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            {
              firstName: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              lastName: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              email: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
          ],
        },
      });
    }

    // Filter by status if provided
    if (status) {
      finalAggregate.push({
        $match: {
          status: status,
        },
      });
    }

    // Filter by hourly rate range if provided
    if (maxHourlyRate) {
      finalAggregate.push({
        $match: {
          "rate.hourlyRate": { $lte: parseInt(maxHourlyRate) },
        },
      });
    }

    if (minHourlyRate) {
      finalAggregate.push({
        $match: {
          "rate.hourlyRate": { $gte: parseInt(minHourlyRate) },
        },
      });
    }

    // Filter by subjects if provided
    if (subjects) {
      const subjectArray = subjects.split(",");
      finalAggregate.push({
        $match: {
          subjects: { $in: subjectArray },
        },
      });
    }

    // Get all coaches' data
    const myAggregate =
      finalAggregate.length > 0 ? Coach.aggregate(finalAggregate).sort({ firstName: 1 }) : Coach.aggregate([]);

    const coaches = await Coach.aggregatePaginate(myAggregate, { page, limit });

    if (!coaches) {
      return res.json(ApiResponse({}, "No Coaches found", false));
    }

    const coachIds = coaches.docs.map((coach) => coach._id);
    const rates1 = await Rate.find({ coach: { $in: coachIds } });

    // Get reviews for each coach and calculate averageRating directly in the aggregation pipeline
    const reviews1 = await Review.aggregate([
      { $match: { coach: { $in: coachIds } } },
      {
        $group: {
          _id: "$coach",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      {
        $project: {
          averageRating: {
            $divide: [{ $trunc: { $multiply: ["$averageRating", 2] } }, 2],
          },
          totalReviews: 1,
        },
      },
    ]);

    // If daysToFilter is not provided, return all coaches without availability filtering
    if (!daysToFilter) {
      
      const coachesWithoutAvailability = coaches.docs.map((coach) => {
        const rateData1 = rates1.find((rate) => rate.coach.equals(coach._id));
        const reviewData1 = reviews1.find((review) => review._id.equals(coach._id));
        return({ ...coach,
          hourlyRate: rateData1 ? rateData1.hourlyRate : 0,
          averageRating: reviewData1 ? reviewData1.averageRating : 0,
          totalReviews: reviewData1 ? reviewData1.totalReviews : 0,
          availability: []});
      });

      // Construct the final response
      const response = {
        docs: coachesWithoutAvailability,
        totalDocs: coaches.totalDocs,
        limit: coaches.limit,
        page: coaches.page,
        totalPages: coaches.totalPages,
        pagingCounter: coaches.pagingCounter,
        hasPrevPage: coaches.hasPrevPage,
        hasNextPage: coaches.hasNextPage,
        prevPage: coaches.prevPage,
        nextPage: coaches.nextPage,
      };

      return res.json(ApiResponse(response));
    }

    // Extract coach IDs from the coaches object


    // Get schedule availability for each coach
    const schedules = await Schedule.find({ coach: { $in: coachIds } });

    // Parse the daysToFilter parameter as an array of numbers
    let parsedDaysToFilter = [];
    if (daysToFilter) {
      parsedDaysToFilter = daysToFilter.split(",").map(Number);
    }

    // Filter coaches based on availability on the specified days
    const coachIdsWithAvailability = new Set();
    schedules.forEach((schedule) => {
      const filteredAvailability = schedule.availability.filter((avail) =>
        parsedDaysToFilter.includes(avail.day)
      );
      if (filteredAvailability.length > 0) {
        coachIdsWithAvailability.add(schedule.coach.toString());
        schedule.availability = filteredAvailability;
      } else {
        schedule.availability = []; // Remove the availability if there are no matches
      }
    });

    // Convert Set to an array of coachIds
    const coachIdsArray = [...coachIdsWithAvailability];

    // Filter coaches based on availability
    const coachesWithAvailability = coaches.docs.filter((coach) =>
      coachIdsArray.includes(coach._id.toString())
    );

    // Get rates for each coach
    const rateIds = coachesWithAvailability.map((coach) => coach._id);
    const rates = await Rate.find({ coach: { $in: rateIds } });

    // Get reviews for each coach and calculate averageRating directly in the aggregation pipeline
    const reviews = await Review.aggregate([
      { $match: { coach: { $in: rateIds } } },
      {
        $group: {
          _id: "$coach",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      {
        $project: {
          averageRating: {
            $divide: [{ $trunc: { $multiply: ["$averageRating", 2] } }, 2],
          },
          totalReviews: 1,
        },
      },
    ]);

    // Map rates, schedules, and reviews to each coach
    const coachesWithRatesAndAvailability = coachesWithAvailability.map((coach) => {
      const rateData = rates.find((rate) => rate.coach.equals(coach._id));
      const scheduleData = schedules.find((schedule) => schedule.coach.equals(coach._id));
      const reviewData = reviews.find((review) => review._id.equals(coach._id));
      return {
        ...coach,
        hourlyRate: rateData ? rateData.hourlyRate : 0,
        availability: scheduleData ? scheduleData.availability : [],
        averageRating: reviewData ? reviewData.averageRating : 0,
        totalReviews: reviewData ? reviewData.totalReviews : 0,
      };
    });

    // Construct the final response
    const response = {
      docs: coachesWithRatesAndAvailability,
      totalDocs: coaches.totalDocs,
      limit: coaches.limit,
      page: coaches.page,
      totalPages: coaches.totalPages,
      pagingCounter: coaches.pagingCounter,
      hasPrevPage: coaches.hasPrevPage,
      hasNextPage: coaches.hasNextPage,
      prevPage: coaches.prevPage,
      nextPage: coaches.nextPage,
    };

    return res.json(ApiResponse(response));
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};

exports.getAllTutors = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    from,
    to,
    keyword,
    maxHourlyRate,
    minHourlyRate,
    subjects,
    daysToFilter,
  } = req.query;

  try {
    let finalAggregate = [];

    finalAggregate.push({
      $lookup: {
        from: "rates",
        localField: "_id",
        foreignField: "coach",
        as: "rate",
      },
    });

    finalAggregate.push({
      $match: {
        applicationType: { $in: ["BOTH", "TUTORING"] },
      },
    });

    finalAggregate.push({
      $project: {
        salt: 0,
        hashed_password: 0,
      },
    });

    // Filter by keyword if provided
    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            {
              firstName: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              lastName: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              email: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
          ],
        },
      });
    }

    // Filter by status if provided
    if (status) {
      finalAggregate.push({
        $match: {
          status: status,
        },
      });
    }

    // Filter by hourly rate range if provided
    if (maxHourlyRate) {
      finalAggregate.push({
        $match: {
          "rate.hourlyRate": { $lte: parseInt(maxHourlyRate) },
        },
      });
    }

    if (minHourlyRate) {
      finalAggregate.push({
        $match: {
          "rate.hourlyRate": { $gte: parseInt(minHourlyRate) },
        },
      });
    }

    // Filter by subjects if provided
    if (subjects) {
      const subjectArray = subjects.split(",");
      finalAggregate.push({
        $match: {
          subjects: { $in: subjectArray },
        },
      });
    }

    // Get all coaches' data
    const myAggregate =
      finalAggregate.length > 0 ? Coach.aggregate(finalAggregate).sort({ firstName: 1 }) : Coach.aggregate([]);

    const coaches = await Coach.aggregatePaginate(myAggregate, { page, limit });

    if (!coaches) {
      return res.json(ApiResponse({}, "No Tutors found", false));
    }

    const coachIds = coaches.docs.map((coach) => coach._id);
    const rates1 = await Rate.find({ coach: { $in: coachIds } });

    // Get reviews for each coach and calculate averageRating directly in the aggregation pipeline
    const reviews1 = await Review.aggregate([
      { $match: { coach: { $in: coachIds } } },
      {
        $group: {
          _id: "$coach",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      {
        $project: {
          averageRating: {
            $divide: [{ $trunc: { $multiply: ["$averageRating", 2] } }, 2],
          },
          totalReviews: 1,
        },
      },
    ]);

    // If daysToFilter is not provided, return all coaches without availability filtering
    if (!daysToFilter) {
      
      const coachesWithoutAvailability = coaches.docs.map((coach) => {
        const rateData1 = rates1.find((rate) => rate.coach.equals(coach._id));
        const reviewData1 = reviews1.find((review) => review._id.equals(coach._id));
        return({ ...coach,
          hourlyRate: rateData1 ? rateData1.hourlyRate : 0,
          averageRating: reviewData1 ? reviewData1.averageRating : 0,
          totalReviews: reviewData1 ? reviewData1.totalReviews : 0,
          availability: []});
      });

      // Construct the final response
      const response = {
        docs: coachesWithoutAvailability,
        totalDocs: coaches.totalDocs,
        limit: coaches.limit,
        page: coaches.page,
        totalPages: coaches.totalPages,
        pagingCounter: coaches.pagingCounter,
        hasPrevPage: coaches.hasPrevPage,
        hasNextPage: coaches.hasNextPage,
        prevPage: coaches.prevPage,
        nextPage: coaches.nextPage,
      };

      return res.json(ApiResponse(response));
    }

    // Extract coach IDs from the coaches object


    // Get schedule availability for each coach
    const schedules = await Schedule.find({ coach: { $in: coachIds } });

    // Parse the daysToFilter parameter as an array of numbers
    let parsedDaysToFilter = [];
    if (daysToFilter) {
      parsedDaysToFilter = daysToFilter.split(",").map(Number);
    }

    // Filter coaches based on availability on the specified days
    const coachIdsWithAvailability = new Set();
    schedules.forEach((schedule) => {
      const filteredAvailability = schedule.availability.filter((avail) =>
        parsedDaysToFilter.includes(avail.day)
      );
      if (filteredAvailability.length > 0) {
        coachIdsWithAvailability.add(schedule.coach.toString());
        schedule.availability = filteredAvailability;
      } else {
        schedule.availability = []; // Remove the availability if there are no matches
      }
    });

    // Convert Set to an array of coachIds
    const coachIdsArray = [...coachIdsWithAvailability];

    // Filter coaches based on availability
    const coachesWithAvailability = coaches.docs.filter((coach) =>
      coachIdsArray.includes(coach._id.toString())
    );

    // Get rates for each coach
    const rateIds = coachesWithAvailability.map((coach) => coach._id);
    const rates = await Rate.find({ coach: { $in: rateIds } });

    // Get reviews for each coach and calculate averageRating directly in the aggregation pipeline
    const reviews = await Review.aggregate([
      { $match: { coach: { $in: rateIds } } },
      {
        $group: {
          _id: "$coach",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
      {
        $project: {
          averageRating: {
            $divide: [{ $trunc: { $multiply: ["$averageRating", 2] } }, 2],
          },
          totalReviews: 1,
        },
      },
    ]);

    // Map rates, schedules, and reviews to each coach
    const coachesWithRatesAndAvailability = coachesWithAvailability.map((coach) => {
      const rateData = rates.find((rate) => rate.coach.equals(coach._id));
      const scheduleData = schedules.find((schedule) => schedule.coach.equals(coach._id));
      const reviewData = reviews.find((review) => review._id.equals(coach._id));
      return {
        ...coach,
        hourlyRate: rateData ? rateData.hourlyRate : 0,
        availability: scheduleData ? scheduleData.availability : [],
        averageRating: reviewData ? reviewData.averageRating : 0,
        totalReviews: reviewData ? reviewData.totalReviews : 0,
      };
    });

    // Construct the final response
    const response = {
      docs: coachesWithRatesAndAvailability,
      totalDocs: coaches.totalDocs,
      limit: coaches.limit,
      page: coaches.page,
      totalPages: coaches.totalPages,
      pagingCounter: coaches.pagingCounter,
      hasPrevPage: coaches.hasPrevPage,
      hasNextPage: coaches.hasNextPage,
      prevPage: coaches.prevPage,
      nextPage: coaches.nextPage,
    };

    return res.json(ApiResponse(response));
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};


//get user by id
exports.getStudentById = async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
      return res.json(ApiResponse({}, "No student found", false));
      }
      return res.json(ApiResponse(user));
  } catch (error) {
      return res.json(ApiResponse({}, error.message, false));
  }
  }

  function roundToHalf(num) {
    return Math.round(num * 2) / 2;
  }

  
//get user by id
exports.getCoachById = async (req, res) => {
  try {
      const coach = await Coach.findById(req.params.id);
      let schedule = await Schedule.findOne({coach:req.params.id})
      let rate = await Rate.findOne({coach:req.params.id})

      const aggregate = [
        { $match: { coach: new mongoose.Types.ObjectId(req.params.id) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            averageRating: 1,
            totalReviews: 1,
          },
        },
      ];
  
      let review = { averageRating: 0, totalReviews: 0 };


      const result = await Review.aggregate(aggregate).exec();

      if(result.length > 0){
        review.averageRating = roundToHalf(result[0]?.averageRating);
        review.totalReviews = result[0].totalReviews
      }

      if (!coach) {
      return res.json(ApiResponse({}, "No coach found", false));
      }
      return res.json(ApiResponse({coach,schedule,rate,review}));
  } catch (error) {
      return res.json(ApiResponse({}, error.message, false));
  }
  }


//update admin
exports.updateStudent = async (req, res) => {
  try {
    if (req.body.image) {
        let currentUser = await User.findById(req.params.id);
          if (currentUser.image) {
            fs.unlinkSync(`./Uploads/${currentUser.image}`);
          }
      }


    let user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.json(ApiResponse({}, "No student found", false));
    }
    return res.json(ApiResponse(user, "Student updated successfully"));
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};


//update admin
exports.updateCoach = async (req, res) => {
  try {
    if (req.body.image) {
        let currentCoach = await Coach.findById(req.params.id);
          if (currentCoach.image) {
            fs.unlinkSync(`./Uploads/${currentCoach.image}`);
          }
      }


    let coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!coach) {
      return res.json(ApiResponse({}, "No coach found", false));
    }
    return res.json(ApiResponse(coach, "Coach updated successfully"));
  } catch (error) {
    return res.json(ApiResponse({}, error.message, false));
  }
};