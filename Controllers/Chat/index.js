//Models
const User = require("../../Models/User")
const Chat = require("../../Models/Chat")

//Helpers
const { ApiResponse } = require("../../Helpers/index");

//libraries
const dayjs = require("dayjs");


//create Chat
exports.createChat = async (req, res) => {
  const { student,coach } = req.body;
  try {

    let user = await User.findById(student)

    if(!user){
        return res
        .status(400)
        .json(ApiResponse({},  "Student not Found",false));
    }


    let _coach = await User.findById(coach)

    if(!_coach){
        return res
        .status(400)
        .json(ApiResponse({},  "Coach not Found",false));
    }


    let chat = await Chat.findOne({ student,coach });

    if (chat) {
      return res
        .status(400)
        .json(ApiResponse(chat, "Chat Between these Two users already exists", false));
    }

    chat = new Chat({
      student,
      coach,
      status:"ACTIVE"
    });

    await chat.save();

    return res
      .status(200)
      .json(
        ApiResponse(
          { chat },
       
          "Chat Created Successfully",
          true
        )
      );
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message,false));
  }
};

//get all My chats
exports.getMyChats = async (req, res) => {
    const { type } = req.query;

    console.log("req.usre",req.user._isd)
    try {

        if(type == "student"){
            let chats = Chat.find({student:req.user._id}).populate("")

            if(!chats){
                return res.status(200).json(ApiResponse({},"chats not found",false)) 
            }

            return res.status(200).json(ApiResponse(chats,"",true))
        }else{
            let chats = Chat.find({coach:req.user._id})

            if(!chats){
                return res.status(200).json(ApiResponse({},"chats not found",false)) 
            }

            return res.status(200).json(ApiResponse(chats,"",true))
        }
    } catch (error) {
      return res.status(500).json(ApiResponse({}, error.message,false));
    }
  };
