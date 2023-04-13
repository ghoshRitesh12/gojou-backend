import mongoose from "mongoose";

const collectionName = 'Rooms';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
    trim: true,
  },
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
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  mods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  

}, { collection: collectionName })

const model = mongoose.model(collectionName, userSchema)

export default model;
