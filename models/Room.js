import mongoose from "mongoose";
import { randomBytes } from 'crypto';

const collectionName = 'Rooms';

const roomSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [/^[a-zA-Z0-9_-]{3,20}$/, 'is invalid'],
      index: true,
    },
    roomId: {
      type: String,
      default: () => randomBytes(6).toString('hex'),
      unique: true
    },
    avatar: {
      type: String,
      required: true,
      trim: true,
    },
    private: {
      type: Boolean,
      default: true
    },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    mods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    animeId: {
      type: String,
      default: null
    },
    animeEpisodeId: {
      type: String,
      default: null
    },
    animeEpisodeNo: {
      type: Number,
      default: 1
    },
    
    
  }, 
  { 
    collection: collectionName,
    timestamps: true 
  }
)

const model = mongoose.model(collectionName, roomSchema)

export default model;
