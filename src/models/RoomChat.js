import mongoose from "mongoose";

const collectionName = 'RoomChats';

const roomChatSchema = new mongoose.Schema({
    refRoomId: {
      type: String,
      required: true,
      unique: true
    },
    messages: [{
      text: {
        type: String,
        required: true,
      },
      sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users' 
      },
      timestamp: {
        type: String,
        required: true
      }
    }]  
    
  }, 
  { 
    collection: collectionName,
    timestamps: true 
  }
)

const model = mongoose.model(collectionName, roomChatSchema)

export default model;
