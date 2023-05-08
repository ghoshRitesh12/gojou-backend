import mongoose from "mongoose";

const connectDB = async DATABASE_URI => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(DATABASE_URI);
    console.log('💾 connected to DB');
    
  } catch (err) {
    console.log('Could not connect to the db');
  }
}
export default connectDB;
