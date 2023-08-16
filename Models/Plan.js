const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const planSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    durationInDays:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        default:0
    },
    isActive:{
        type:Boolean,
        default:true
    },
    features:[
        {
            type:String,
        }
    ],
}, {timestamps:true})

planSchema.plugin(mongoosePaginate);
planSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("plan", planSchema)