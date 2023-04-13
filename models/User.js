import mongoose from "mongoose";

const collectionName = 'Users';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  profilePic: {
    type: String,
    required: true,
    trim: true,
  },
  googleId: {
    type: String,
    default: null
  },
  password: {
    type: String,
    default: null
  },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rooms' }],
  favoriteAnimes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FavoriteAnimes' }],


}, { collection: collectionName })

const model = mongoose.model(collectionName, userSchema)

export default model;
