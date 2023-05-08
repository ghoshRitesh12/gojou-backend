import mongoose from "mongoose";
import passportLocalMongoose from 'passport-local-mongoose';
import findOrCreate from 'mongoose-findorcreate';
import { signJwt } from "../config/jwt.js";

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
      unique: true
    },
    profilePicture: {
      type: String,
      default: () => (
        `https://api.dicebear.com/6.x/bottts/png?seed=${Date.now()}&eyes=shade01&scale=120&mouth=smile01&texture=circuits`
      )
    },
    googleId: {
      type: String,
      default: null
    },
    createdRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rooms' }],
    relatedRooms: [{
      role: { type: String, default: 'member' },
      roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rooms' }     
    }],
    favoriteAnimes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FavoriteAnimes' }],
    

  }, 
  { 
    collection: collectionName, 
    timestamps: true 
  }
)

userSchema.plugin(findOrCreate);
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
});

userSchema.methods.generateAccessJwt = async function () {
  return await signJwt(
    { id: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    '30m'
  ) 
}

userSchema.methods.generateRefreshJwt = async function () {
  return await signJwt(
    { id: this._id, email: this.email },
    process.env.REFRESH_TOKEN_SECRET,
    '20d'
  ) 
}

export default mongoose.model(collectionName, userSchema);
