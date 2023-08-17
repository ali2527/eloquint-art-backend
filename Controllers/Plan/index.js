//Models
const Plan = require("../../Models/Plan");
const fs = require("fs");
const { ApiResponse } = require("../../Helpers");

exports.list =async (req, res) => {
  if (req.params.id) {
    let plan = await Plan.findById(req.params.id)

    if(!plan){
        return res.json(ApiResponse({},"Plan Not Found",false));
    }
    return res.json(ApiResponse(plan,"",true));


  } else {
    const { page = 1, limit = 10, status, from, to, keyword } = req.query;

    let finalAggregate = [];

    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            {
              title: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
            {
              description: {
                $regex: ".*" + keyword.toLowerCase() + ".*",
                $options: "i",
              },
            },
          ],
        },
      });
    }

    console.log(status);
    if (status) {
      finalAggregate.push({
        $match: {
          isActive: status == "active" ? true : false,
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

    let myAggregate =
      finalAggregate.length > 0
        ? Plan.aggregate(finalAggregate)
        : Plan.aggregate([]);

    console.log(finalAggregate);

    Plan.aggregatePaginate(myAggregate, { page, limit }).then((plan) => {
      return res.status(200).send(plan);
    });
  }
};

exports.create = async (req, res) => {
  if (req.params.id) {

    let plan = await Plan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true })

      if(!plan){
        return res.json(ApiResponse({},"Plan not Found",false));
      }
      return res.json(ApiResponse(plan,"Plan Updated Successfully",true));
  } else {
    try {
        const plan = new Plan(req.body);

        await plan.save() 
        return res.json(ApiResponse(plan,"Plan Added Successfully",true));
    } catch (error) {
        return res.json(ApiResponse({},"Something went wrong",false));
    }
   
  }
};

exports.remove =async (req, res) => {
  let plan = await Plan.findByIdAndDelete(req.params.id)

  if(!plan){
    return res.json(ApiResponse({},"Plan not Found",false));
  }
  return res.json(ApiResponse(plan,"Plan Deleted Successfully",true));
};
