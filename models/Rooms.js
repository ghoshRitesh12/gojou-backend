import mongoose from "mongoose";

const collectionName = 'Rooms';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true,
  },
  avatar: {
    type: String,
    required: true,
    trim: true,
  },
  isPrivate: {
    type: Boolean,
    default: false
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
  animeEpisodeCategory: {
    type: String,
    default: null
  },
  animeEpisodeServer: {
    type: String,
    default: null
  },
  animeEpisodeNo: {
    type: String,
    default: null
  },
  
  
}, { collection: collectionName })

const model = mongoose.model(collectionName, userSchema)

export default model;
