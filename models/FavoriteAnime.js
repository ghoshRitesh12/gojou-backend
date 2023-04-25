import mongoose from "mongoose";

const collectionName = 'FavoriteAnimes';

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: null
  },
  duration: {
    type: String,
    default: null
  }, 
  episodes: {
    type: String,
    default: null
  },  

}, { collection: collectionName })

const model = mongoose.model(collectionName, userSchema)

export default model;
